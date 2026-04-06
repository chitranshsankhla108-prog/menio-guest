import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Create a simple notification sound using Web Audio API
function playNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    
    // Create oscillator for the ping sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Pleasant notification tone
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5 note
    oscillator.frequency.setValueAtTime(1046.5, audioContext.currentTime + 0.1); // C6 note
    
    // Envelope for smooth sound
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.02);
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.log('Audio notification not supported:', error);
  }
}

export function useOrderNotifications() {
  const queryClient = useQueryClient();
  const lastOrderCountRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);

  const handleNewOrder = useCallback(() => {
    playNotificationSound();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('order-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          // Only play sound after initial load
          if (isInitializedRef.current) {
            handleNewOrder();
          }
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          queryClient.invalidateQueries({ queryKey: ['todays-revenue'] });
          queryClient.invalidateQueries({ queryKey: ['top-selling-item'] });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          queryClient.invalidateQueries({ queryKey: ['todays-revenue'] });
        }
      )
      .subscribe();

    // Mark as initialized after a short delay to prevent sound on initial load
    const initTimeout = setTimeout(() => {
      isInitializedRef.current = true;
    }, 2000);

    return () => {
      clearTimeout(initTimeout);
      supabase.removeChannel(channel);
    };
  }, [queryClient, handleNewOrder]);

  return { playNotificationSound };
}