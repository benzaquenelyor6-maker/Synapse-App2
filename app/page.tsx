'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ArticleIcon from '@mui/icons-material/Article';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { db } from '../firebase/config';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';

import Editor from '../components/Editor';
import QuizPlayer from '../components/QuizPlayer'; // NOUVEAU : Import du lecteur de quiz

const drawerWidth = 240;

type Keyword = { term: string; definition: string; };
type QuizQuestion = { question: string; options: string[]; correctAnswer: string; };
type Analysis = { keywords?: Keyword[]; summary?: string; quiz?: QuizQuestion[] };
type CourseNote = { id: string; title: string; order: number; analysis?: Analysis };

// --- Composant Principal ---
export default function SynapseApp() {
  const [courses, setCourses] = React.useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = React.useState<string | null>(null);
  const [selectedNote, setSelectedNote] = React.useState<CourseNote | null>(null);
  const [isEditingNote, setIsEditingNote] = React.useState(false);
  const [newCourseName, setNewCourseName] = React.useState("");
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [courseNotes, setCourseNotes] = React.useState<CourseNote[]>([]);
  const [newNoteTitle, setNewNoteTitle] = React.useState("");

  const fetchCourses = async () => {
    const querySnapshot = await getDocs(collection(db, "courses"));
    setCourses(querySnapshot.docs.map(doc => doc.id));
  };

  const fetchCourseNotes = async (courseId: string) => {
    const notesSnapshot = await getDocs(collection(db, "courses", courseId, "notes"));
    const notesList = notesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CourseNote));
    notesList.sort((a, b) => (a.order || 0) - (b.order || 0));
    setCourseNotes(notesList);
  };

  React.useEffect(() => { fetchCourses(); }, []);

  const handleCourseClick = async (courseName: string) => {
    setSelectedCourse(courseName);
    setSelectedNote(null);
    setIsEditingNote(false);
    await fetchCourseNotes(courseName);
  };

  const handleAddCourse = async () => {
    if (newCourseName && !courses.includes(newCourseName)) {
      await setDoc(doc(db, "courses", newCourseName), {});
      setNewCourseName("");
      await fetchCourses();
    }
  };

  const handleAddNote = async () => {
    if (selectedCourse && newNoteTitle) {
      const newNoteRef = doc(collection(db, "courses", selectedCourse, "notes"));
      await setDoc(newNoteRef, { title: newNoteTitle, order: courseNotes.length });
      setNewNoteTitle("");
      await fetchCourseNotes(selectedCourse);
    }
  };

  const handleNoteAnalysis = async (noteId: string, action: 'keywords' | 'summary' | 'quiz') => {
    if (!selectedCourse) return;
    setIsAnalyzing(true);

    const docRef = doc(db, "courses", selectedCourse, "notes", noteId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists() || !docSnap.data().editorContent) {
      alert("Veuillez enregistrer du contenu pour cette note avant de l'analyser.");
      setIsAnalyzing(false);
      return;
    }

    const editorState = JSON.parse(docSnap.data().editorContent);
    const plainText = editorState.root.children.map((p: any) => p.children.map((c: any) => c.text).join('\n')).join('\n');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseText: plainText, subject: selectedCourse, action }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur inconnue');

      const existingAnalysis = docSnap.data().analysis || {};
      const newAnalysis = { ...existingAnalysis, ...data };

      await setDoc(docRef, { analysis: newAnalysis }, { merge: true });
      setSelectedNote(prev => prev ? { ...prev, analysis: newAnalysis } : null);

    } catch (error: any) {
      alert(`Erreur: ${error.message}`);
    }
    setIsAnalyzing(false);
  };

  const renderNoteDetail = () => {
    if (!selectedNote || !selectedCourse) return null;

    if (isEditingNote) {
      return <Editor selectedCourseId={selectedCourse} selectedBoxId={selectedNote.id} onSave={() => { setIsEditingNote(false); fetchCourseNotes(selectedCourse).then(() => setSelectedNote(selectedNote)); }} isEditable={true} />;
    }

    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => setSelectedNote(null)} sx={{ mb: 2 }}>Retour à la liste des notes</Button>
        <Typography variant="h5" gutterBottom>{selectedNote.title}</Typography>
        <Editor selectedCourseId={selectedCourse} selectedBoxId={selectedNote.id} onSave={() => {}} isEditable={false} />
        <Button onClick={() => setIsEditingNote(true)} startIcon={<EditIcon />} sx={{ my: 2 }}>Modifier cette note</Button>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6">Analyse IA</Typography>
        <Box sx={{ display: 'flex', gap: 2, my: 2, flexWrap: 'wrap' }}>
          <Button variant="outlined" onClick={() => handleNoteAnalysis(selectedNote.id, 'summary')} disabled={isAnalyzing}>Générer Résumé</Button>
          <Button variant="outlined" onClick={() => handleNoteAnalysis(selectedNote.id, 'keywords')} disabled={isAnalyzing}>Extraire Mots-clés</Button>
          <Button variant="outlined" onClick={() => handleNoteAnalysis(selectedNote.id, 'quiz')} disabled={isAnalyzing}>Générer un Quiz</Button>
          {isAnalyzing && <CircularProgress size={24} />}
        </Box>
        {selectedNote.analysis && (
          <Box>
            {selectedNote.analysis.summary && <Box sx={{mb:2}}><Typography variant="subtitle1" gutterBottom><b>Résumé</b></Typography><Typography paragraph sx={{whiteSpace: 'pre-wrap'}}>{selectedNote.analysis.summary}</Typography></Box>}
            {selectedNote.analysis.keywords && <Box sx={{mb:2}}><Typography variant="subtitle1" gutterBottom><b>Mots-clés</b></Typography><List>{selectedNote.analysis.keywords.map(k => <ListItem key={k.term}><ListItemText primary={k.term} secondary={k.definition} /></ListItem>)}</List></Box>}
            {selectedNote.analysis.quiz && <Box sx={{mt:2}}><QuizPlayer quiz={selectedNote.analysis.quiz} /></Box>}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar><Typography variant="h6" noWrap component="div">Synapse</Typography></Toolbar>
      </AppBar>
      <Drawer variant="permanent" sx={{ width: drawerWidth, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' } }}>
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}><List>
          {courses.map((text) => (
            <ListItem key={text} disablePadding>
              <ListItemButton onClick={() => handleCourseClick(text)} selected={selectedCourse === text}>
                <ListItemIcon>{text.toLowerCase().includes('droit') ? <AccountBalanceIcon /> : <ArticleIcon />}</ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}</List></Box>
        <Divider />
        <Box sx={{ p: 2 }}>
          <TextField label="Nouveau cours" variant="outlined" size="small" fullWidth value={newCourseName} onChange={(e) => setNewCourseName(e.target.value)} />
          <Button variant="contained" fullWidth sx={{ mt: 1 }} onClick={handleAddCourse}>Ajouter</Button>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {selectedCourse ? (
          <Box>
            <Typography variant="h4" gutterBottom>{selectedCourse}</Typography>
            <Divider sx={{ my: 2 }} />
            {selectedNote ? renderNoteDetail() : (
              <Box>
                <Typography variant="h5" gutterBottom>Notes du cours</Typography>
                <List>{courseNotes.map((note) => (
                    <ListItem key={note.id} disablePadding><ListItemButton onClick={() => setSelectedNote(note)}><ListItemText primary={note.title} /></ListItemButton></ListItem>
                ))}</List>
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <TextField label="Titre nouvelle note" variant="outlined" size="small" sx={{ flexGrow: 1 }} value={newNoteTitle} onChange={(e) => setNewNoteTitle(e.target.value)} />
                  <Button variant="contained" onClick={handleAddNote}><AddIcon /></Button>
                </Box>
              </Box>
            )}
          </Box>
        ) : (
          <Typography paragraph>Bienvenue. Sélectionnez un cours ou créez-en un nouveau.</Typography>
        )}
      </Box>
    </Box>
  );
}
