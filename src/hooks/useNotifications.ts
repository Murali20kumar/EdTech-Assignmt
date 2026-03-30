import { useEffect } from 'react';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export const useNotifications = () => {
    useEffect(() => {
        if (isExpoGo) {
            return;
        }

        const setup = async () => {
            try {
                const Notifications = require('expo-notifications');

                Notifications.setNotificationHandler({
                    handleNotification: async () => ({
                        shouldShowAlert: true,
                        shouldPlaySound: true,
                        shouldSetBadge: true,
                    }),
                });

                if (Platform.OS === 'android') {
                    await Notifications.setNotificationChannelAsync('default', {
                        name: 'default',
                        importance: Notifications.AndroidImportance.MAX,
                        vibrationPattern: [0, 250, 250, 250],
                        lightColor: '#FF231F7C',
                    });
                }
                
                if (Device.isDevice) {
                    const { status: existingStatus } = await Notifications.getPermissionsAsync();
                    let finalStatus = existingStatus;

                    if (existingStatus !== 'granted') {
                        const { status } = await Notifications.requestPermissionsAsync();
                        finalStatus = status;
                    }

                    if (finalStatus === 'granted') {
                        scheduleInactivityReminder();
                    }
                }
            } catch (e) {
                console.log('Push setup failed:', e);
            }
        };

        setup();
    }, []);

    const scheduleInactivityReminder = async () => {
        if (isExpoGo) return;
        try {
            const Notifications = require('expo-notifications');
            await Notifications.cancelAllScheduledNotificationsAsync();
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "We miss you! 📚",
                    body: "It's been 24 hours. Jump back in and finish saving courses for your future!",
                    sound: true,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                    seconds: 60 * 60 * 24,
                    repeats: false
                },
            });
        } catch (e) {
            console.log('Skipped 24-hr scheduling Error:', e);
        }
    };

    const triggerInstantNotification = async (title: string, body: string) => {
        if (!isExpoGo) {
            try {
                const Notifications = require('expo-notifications');
                await Notifications.scheduleNotificationAsync({
                    content: { title, body, sound: true },
                    trigger: null, 
                });
            } catch (e) {
                console.log('Native notification failed');
            }
        }
        
        const { Alert } = require('react-native');
        Alert.alert(title, body);
    };

    return { triggerInstantNotification };
};
