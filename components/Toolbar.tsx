'use client';

import * as React from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { FORMAT_TEXT_COMMAND, FORMAT_ELEMENT_COMMAND, INDENT_CONTENT_COMMAND, OUTDENT_CONTENT_COMMAND, REDO_COMMAND, UNDO_COMMAND } from 'lexical';
import { $getSelection, $isRangeSelection } from 'lexical';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignRight';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import RedoIcon from '@mui/icons-material/Redo';
import UndoIcon from '@mui/icons-material/Undo';
import Box from '@mui/material/Box';

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = React.useState(editor);
  const [isBold, setIsBold] = React.useState(false);
  const [isItalic, setIsItalic] = React.useState(false);
  const [isUnderline, setIsUnderline] = React.useState(false);

  const updateToolbar = React.useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
    }
  }, []);

  React.useEffect(() => {
    return editor.registerCommand(
      FORMAT_TEXT_COMMAND,
      (payload) => {
        updateToolbar();
        return false;
      },
      0
    );
  }, [editor, updateToolbar]);

  React.useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  const formatText = (format: string) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const formatAlign = (align: string) => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, align);
  };

  return (
    <Box sx={{ mb: 1, p: 1, borderBottom: '1px solid #eee', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      <ToggleButtonGroup size="small" exclusive>
        <ToggleButton value="bold" selected={isBold} onChange={() => formatText('bold')}>
          <FormatBoldIcon />
        </ToggleButton>
        <ToggleButton value="italic" selected={isItalic} onChange={() => formatText('italic')}>
          <FormatItalicIcon />
        </ToggleButton>
        <ToggleButton value="underline" selected={isUnderline} onChange={() => formatText('underline')}>
          <FormatUnderlinedIcon />
        </ToggleButton>
      </ToggleButtonGroup>

      <ToggleButtonGroup size="small" exclusive>
        <ToggleButton value="left" onClick={() => formatAlign('left')}>
          <FormatAlignLeftIcon />
        </ToggleButton>
        <ToggleButton value="center" onClick={() => formatAlign('center')}>
          <FormatAlignCenterIcon />
        </ToggleButton>
        <ToggleButton value="right" onClick={() => formatAlign('right')}>
          <FormatAlignRightIcon />
        </ToggleButton>
        <ToggleButton value="justify" onClick={() => formatAlign('justify')}>
          <FormatAlignJustifyIcon />
        </ToggleButton>
      </ToggleButtonGroup>

      <ToggleButtonGroup size="small" exclusive>
        <ToggleButton value="undo" onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}>
          <UndoIcon />
        </ToggleButton>
        <ToggleButton value="redo" onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}>
          <RedoIcon />
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}
