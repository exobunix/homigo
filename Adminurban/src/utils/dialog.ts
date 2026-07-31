import { Alert, Platform } from 'react-native';

/**
 * Cross-platform confirmation dialog
 * Works on both mobile (Alert.alert) and web (window.confirm)
 */
export const showConfirmDialog = (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
): void => {
    if (Platform.OS === 'web') {
        // Web: Use window.confirm
        const confirmed = window.confirm(`${title}\n\n${message}`);
        if (confirmed) {
            onConfirm();
        } else if (onCancel) {
            onCancel();
        }
    } else {
        // Mobile: Use Alert.alert
        Alert.alert(
            title,
            message,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: onCancel
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: onConfirm
                }
            ]
        );
    }
};

/**
 * Show success message
 */
export const showSuccessMessage = (message: string): void => {
    if (Platform.OS === 'web') {
        alert(message);
    } else {
        Alert.alert('Success', message);
    }
};

/**
 * Show error message
 */
export const showErrorMessage = (message: string): void => {
    if (Platform.OS === 'web') {
        alert(`Error: ${message}`);
    } else {
        Alert.alert('Error', message);
    }
};
