// Web Notification Service with Sound
export class WebNotificationService {
    private static audio: HTMLAudioElement | null = null;

    static async requestPermission(): Promise<boolean> {
        if (typeof window === 'undefined' || !('Notification' in window)) {
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }

        return false;
    }

    static async playSound(): Promise<void> {
        try {
            if (this.audio) {
                this.audio.pause();
                this.audio.currentTime = 0;
            }

            this.audio = new Audio('/notification.mp3');
            this.audio.volume = 1.0;
            await this.audio.play();

            console.log('🔊 Notification sound played');
        } catch (error) {
            console.log('🔇 Could not play sound:', error);
        }
    }

    static stopSound(): void {
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
        }
    }

    static async show(title: string, body: string, options?: {
        icon?: string;
        playSound?: boolean;
        onClick?: () => void;
    }): Promise<void> {
        const hasPermission = await this.requestPermission();

        if (options?.playSound !== false) {
            await this.playSound();
        }

        if (hasPermission) {
            const notification = new Notification(title, {
                body,
                icon: options?.icon || '/assets/icon.png',
                badge: '/assets/icon.png',
                tag: 'urbanprox-notification',
                requireInteraction: true,
            });

            if (options?.onClick) {
                notification.onclick = () => {
                    window.focus();
                    options.onClick?.();
                    notification.close();
                };
            }

            // Auto-close after 10 seconds
            setTimeout(() => notification.close(), 10000);
        }

        console.log(`🔔 Notification: ${title} - ${body}`);
    }
}

export default WebNotificationService;
