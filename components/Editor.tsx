'use client';

import * as React from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { EditorState } from 'lexical';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import { db } from '../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

import ToolbarPlugin from './Toolbar';

const theme = {};
function onError(error: Error) { console.error(error); }

// --- Composant Editeur ---
export default function Editor({ selectedCourseId, selectedBoxId, onSave, isEditable }: { selectedCourseId: string, selectedBoxId: string, onSave: () => void, isEditable: boolean }) {
  const [initialContent, setInitialContent] = React.useState<string | null>(null);
  const [currentContent, setCurrentContent] = React.useState<EditorState | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    const loadContent = async () => {
      if (!selectedCourseId || !selectedBoxId) return;

      const docRef = doc(db, "courses", selectedCourseId, "notes", selectedBoxId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().editorContent) {
        setInitialContent(docSnap.data().editorContent);
      } else {
        const emptyState = JSON.stringify({"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}});
        setInitialContent(emptyState);
      }
    };
    loadContent();
  }, [selectedCourseId, selectedBoxId]);

  const handleSave = async () => {
    if (currentContent) {
      setIsSaving(true);
      const content = JSON.stringify(currentContent.toJSON());
      const docRef = doc(db, "courses", selectedCourseId, "notes", selectedBoxId);
      await setDoc(docRef, { editorContent: content }, { merge: true });
      setIsSaving(false);
      onSave();
    }
  };

  const initialConfig = { 
    namespace: 'MyEditor', 
    theme, 
    onError, 
    editorState: initialContent,
    editable: isEditable // NOUVEAU : On contrôle si l'éditeur est modifiable
  };

  if (!initialContent) return <CircularProgress />;

  return (
    <Box>
      <Box sx={{ border: '1px solid #ccc', borderRadius: '4px', position: 'relative', mb: 2, bgcolor: isEditable ? '#fff' : '#f5f5f5' }}>
        <LexicalComposer initialConfig={initialConfig} key={selectedBoxId}>
          {isEditable && <ToolbarPlugin />} {/* NOUVEAU : La barre d'outils ne s'affiche qu'en mode édition */}
          <RichTextPlugin
            contentEditable={<ContentEditable style={{ minHeight: '200px', padding: '10px', outline: 'none'}} />}
            placeholder={<div style={{ color: '#aaa', pointerEvents: 'none', position: 'absolute', top: isEditable ? '50px' : '10px', left: '10px' }}>Contenu de la note...</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <OnChangePlugin onChange={(state) => setCurrentContent(state)} />
          <HistoryPlugin />
        </LexicalComposer>
      </Box>
      {isEditable && (
        <Button variant="contained" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <CircularProgress size={24} /> : "Enregistrer la note"}
        </Button>
      )}
    </Box>
  );
}
