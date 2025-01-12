import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { supabase } from './lib/supabase';
import { useAuth } from './hooks/useAuth';
import { MobileAuthForm } from './components/mobile/MobileAuthForm';
import { MobileDashboard } from './components/mobile/MobileDashboard';
import { LogOut } from 'lucide-react';

export default function App() {
  const { user, loading: authLoading, signOut } = useAuth();

  if (authLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return <MobileAuthForm />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Subscription Tracker</Text>
        <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
          <LogOut size={20} color="#fff" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      <MobileDashboard />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1d4ed8',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 20,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    padding: 8,
    borderRadius: 8,
  },
  signOutText: {
    color: '#ffffff',
    marginLeft: 8,
  },
});