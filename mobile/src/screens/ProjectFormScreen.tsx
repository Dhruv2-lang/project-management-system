import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Button from '../components/Button';
import DateField from '../components/DateField';
import OptionPills from '../components/OptionPills';
import TextField from '../components/TextField';
import { Banner } from '../components/StateViews';
import { useToast } from '../context/ToastContext';
import { ProjectsStackParamList } from '../navigation/types';
import { ApiError, getErrorMessage } from '../services/api';
import { projectService } from '../services/projectService';
import { colors } from '../theme';
import { ProjectInput, ProjectStatus } from '../types';
import { PROJECT_STATUS_OPTIONS } from '../utils/constants';
import { isoToDateInput, toApiDate } from '../utils/format';
import {
  Errors,
  hasErrors,
  validateDateOrder,
  validateOptionalDate,
  validateOptionalText,
  validateRequiredText,
} from '../utils/validation';

type Props = NativeStackScreenProps<ProjectsStackParamList, 'ProjectForm'>;
type Field = 'name' | 'description' | 'startDate' | 'endDate';

export default function ProjectFormScreen({ navigation, route }: Props) {
  const toast = useToast();
  const editing = route.params?.project;

  const [name, setName] = useState(editing?.name ?? '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [status, setStatus] = useState<ProjectStatus>(editing?.status ?? 'NOT_STARTED');
  const [startDate, setStartDate] = useState(isoToDateInput(editing?.startDate));
  const [endDate, setEndDate] = useState(isoToDateInput(editing?.endDate));
  const [errors, setErrors] = useState<Errors<Field>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const next: Errors<Field> = {
      name: validateRequiredText('Project name', name, 150),
      description: validateOptionalText('Description', description, 2000),
      startDate: validateOptionalDate('Start date', startDate),
      endDate: validateOptionalDate('End date', endDate) ?? validateDateOrder(startDate, endDate),
    };
    setErrors(next);
    setFormError(null);
    if (hasErrors(next)) return;

    setSubmitting(true);
    try {
      if (editing) {
        const payload: ProjectInput = {
          name: name.trim(),
          description: description.trim() || null,
          status,
          startDate: toApiDate(startDate),
          endDate: toApiDate(endDate),
        };
        await projectService.update(editing.id, payload);
      } else {
        const payload: ProjectInput = { name: name.trim(), status };
        if (description.trim()) payload.description = description.trim();
        if (startDate) payload.startDate = toApiDate(startDate);
        if (endDate) payload.endDate = toApiDate(endDate);
        await projectService.create(payload);
      }
      toast.show(editing ? 'Project updated' : 'Project created', 'success');
      navigation.goBack();
    } catch (e) {
      if (e instanceof ApiError && e.kind === 'validation') {
        setErrors((prev) => ({ ...prev, ...e.fieldErrors }));
      }
      setFormError(getErrorMessage(e));
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {!!formError && <Banner message={formError} />}
        <TextField label="Project name" value={name} onChangeText={setName} error={errors.name} placeholder="e.g. Website redesign" maxLength={150} />
        <TextField
          label="Description (optional)"
          value={description}
          onChangeText={setDescription}
          error={errors.description}
          placeholder="What is this project about?"
          multiline
          maxLength={2000}
        />
        <OptionPills label="Status" options={PROJECT_STATUS_OPTIONS} value={status} onChange={setStatus} />
        <DateField label="Start date (optional)" value={startDate} onChange={setStartDate} error={errors.startDate} />
        <DateField label="End date (optional)" value={endDate} onChange={setEndDate} error={errors.endDate} />
        <Button title={editing ? 'Save changes' : 'Create project'} onPress={submit} loading={submitting} style={{ marginTop: 8 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40, maxWidth: 640, width: '100%', alignSelf: 'center' },
});
