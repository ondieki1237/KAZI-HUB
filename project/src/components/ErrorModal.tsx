import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

interface ErrorModalProps {
  isOpen: boolean;
  message: string;
  severity?: 'error' | 'warning' | 'info';
  onClose: () => void;
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '12px',
    padding: theme.spacing(2),
    minWidth: '320px',
  },
}));

const IconContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
}));

const StyledDialogTitle = styled(DialogTitle)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 0,
  marginBottom: '16px',
});

const getSeverityColor = (severity: 'error' | 'warning' | 'info') => {
  switch (severity) {
    case 'error':
      return '#d32f2f';
    case 'warning':
      return '#ed6c02';
    case 'info':
      return '#0288d1';
    default:
      return '#d32f2f';
  }
};

const getSeverityIcon = (severity: 'error' | 'warning' | 'info') => {
  switch (severity) {
    case 'error':
      return <ErrorIcon sx={{ fontSize: 48, color: getSeverityColor(severity) }} />;
    case 'warning':
      return <WarningIcon sx={{ fontSize: 48, color: getSeverityColor(severity) }} />;
    case 'info':
      return <InfoIcon sx={{ fontSize: 48, color: getSeverityColor(severity) }} />;
    default:
      return <ErrorIcon sx={{ fontSize: 48, color: getSeverityColor('error') }} />;
  }
};

const getSeverityTitle = (severity: 'error' | 'warning' | 'info') => {
  switch (severity) {
    case 'error':
      return 'Error';
    case 'warning':
      return 'Warning';
    case 'info':
      return 'Information';
    default:
      return 'Error';
  }
};

const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  message,
  severity = 'error',
  onClose,
}) => {
  return (
    <StyledDialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <StyledDialogTitle>
        <Typography variant="h6" component="div">
          {getSeverityTitle(severity)}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>
      <DialogContent sx={{ padding: 0 }}>
        <IconContainer>
          {getSeverityIcon(severity)}
        </IconContainer>
        <Typography variant="body1" align="center" gutterBottom>
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', padding: '16px 0 0 0' }}>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            backgroundColor: getSeverityColor(severity),
            '&:hover': {
              backgroundColor: getSeverityColor(severity),
              opacity: 0.9,
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default ErrorModal; 