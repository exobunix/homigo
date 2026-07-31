import { Alert, Platform } from 'react-native';

export const confirmAction = (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText: string = "Confirm",
    cancelText: string = "Cancel",
    isDestructive: boolean = false
) => {
    if (Platform.OS === 'web') {
        // Web implementation using window.confirm
        const result = window.confirm(`${title}\n\n${message}`);
        if (result) {
            onConfirm();
        } else {
            if (onCancel) onCancel();
        }
    } else {
        // Mobile implementation using Alert.alert
        Alert.alert(
            title,
            message,
            [
                {
                    text: cancelText,
                    style: "cancel",
                    onPress: onCancel
                },
                {
                    text: confirmText,
                    style: isDestructive ? "destructive" : "default",
                    onPress: onConfirm
                }
            ]
        );
    }
};

export const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
        window.alert(`${title}\n\n${message}`);
    } else {
        Alert.alert(title, message);
    }
};
