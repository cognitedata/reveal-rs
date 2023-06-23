import { SENSITIVE_ANNOTATION_LABELS } from '@vision/constants/annotationSettingsConstants';

export const isSensitiveAnnotationLabel = (label?: string) => {
  return label
    ? SENSITIVE_ANNOTATION_LABELS.includes(label.trim().toLowerCase())
    : false;
};
