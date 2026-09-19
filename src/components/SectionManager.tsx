import React, { useState, type Dispatch, type SetStateAction } from 'react';
import { Alert, Keyboard, StyleSheet, Text, View } from 'react-native';

import {
  createSection,
  deleteSectionIfEmpty,
  updateSection,
} from '../data/repositories/sectionRepository';
import type { ReportSection } from '../domain/models';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Button } from './Button';
import { FormField } from './FormField';

interface SectionManagerProps {
  reportId: string;
  sections: ReportSection[];
  onSectionsChange: Dispatch<SetStateAction<ReportSection[]>>;
}

export function SectionManager({
  reportId,
  sections,
  onSectionsChange,
}: SectionManagerProps) {
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const handleAddSection = () => {
    const title = newTitle.trim();
    if (!title) {
      return;
    }

    const section = createSection({ reportId, title });
    onSectionsChange(current => [...current, section]);
    setNewTitle('');
    Keyboard.dismiss();
  };

  const startEditing = (section: ReportSection) => {
    setEditingId(section.id);
    setEditTitle(section.title);
    setEditNotes(section.notes);
  };

  const handleSaveEdit = () => {
    if (!editingId) {
      return;
    }

    const title = editTitle.trim();
    if (!title) {
      Alert.alert('Title required', 'Section title cannot be empty.');
      return;
    }

    const updated = updateSection(editingId, {
      title,
      notes: editNotes,
    });

    if (updated) {
      onSectionsChange(current =>
        current.map(section => (section.id === updated.id ? updated : section)),
      );
    }

    setEditingId(null);
  };

  const handleDelete = (section: ReportSection) => {
    Alert.alert(
      'Delete section?',
      `Remove "${section.title}"? Only empty sections can be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const deleted = deleteSectionIfEmpty(section.id);
            if (!deleted) {
              Alert.alert(
                'Cannot delete',
                'Move or remove photos from this section before deleting it.',
              );
              return;
            }
            onSectionsChange(current =>
              current.filter(item => item.id !== section.id),
            );
            if (editingId === section.id) {
              setEditingId(null);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      {sections.length === 0 ? (
        <Text style={styles.empty}>
          Add sections like Kitchen, Roof, or Before / After to group photos.
        </Text>
      ) : null}

      {sections.map(section =>
        editingId === section.id ? (
          <View key={section.id} style={styles.editCard}>
            <FormField
              label="Section title"
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="e.g. Kitchen"
            />
            <FormField
              label="Section notes"
              value={editNotes}
              onChangeText={setEditNotes}
              placeholder="Optional notes for this area"
              multiline
            />
            <View style={styles.row}>
              <Button
                label="Save"
                onPress={handleSaveEdit}
                style={styles.rowButton}
              />
              <Button
                label="Cancel"
                variant="secondary"
                onPress={() => setEditingId(null)}
                style={styles.rowButton}
              />
            </View>
          </View>
        ) : (
          <View key={section.id} style={styles.sectionRow}>
            <View style={styles.sectionText}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.notes ? (
                <Text style={styles.sectionNotes}>{section.notes}</Text>
              ) : null}
            </View>
            <View style={styles.row}>
              <Button
                label="Edit"
                variant="ghost"
                onPress={() => startEditing(section)}
                style={styles.inlineButton}
              />
              <Button
                label="Delete"
                variant="ghost"
                onPress={() => handleDelete(section)}
                style={styles.inlineButton}
              />
            </View>
          </View>
        ),
      )}

      <FormField
        label="New section"
        value={newTitle}
        onChangeText={setNewTitle}
        placeholder="e.g. Issue Found"
        onSubmitEditing={handleAddSection}
        returnKeyType="done"
      />
      <Button label="Add Section" variant="secondary" onPress={handleAddSection} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  empty: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  sectionRow: {
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  sectionText: {
    gap: 2,
  },
  sectionTitle: {
    ...typography.bodyBold,
  },
  sectionNotes: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  editCard: {
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rowButton: {
    flex: 1,
  },
  inlineButton: {
    minHeight: 40,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
});
