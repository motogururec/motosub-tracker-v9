import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { supabase } from '../../lib/supabase';
import type { Subscription } from '../../types/subscription';

export function MobileDashboard() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('next_billing_date', { ascending: true });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchSubscriptions();
  }, []);

  const totalMonthly = subscriptions.reduce((acc, sub) => {
    return acc + (sub.billing_cycle === 'monthly' ? sub.cost : sub.cost / 12);
  }, 0);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading subscriptions...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Monthly Total</Text>
        <Text style={styles.summaryAmount}>${totalMonthly.toFixed(2)}</Text>
      </View>

      <View style={styles.subscriptionsList}>
        <Text style={styles.sectionTitle}>Your Subscriptions</Text>
        {subscriptions.map((sub) => (
          <View key={sub.id} style={styles.subscriptionCard}>
            <View style={styles.subscriptionHeader}>
              <Text style={styles.serviceName}>{sub.service_name}</Text>
              <Text style={styles.cost}>
                ${sub.cost} / {sub.billing_cycle}
              </Text>
            </View>
            <View style={styles.subscriptionDetails}>
              <Text style={styles.category}>{sub.category}</Text>
              <Text style={styles.nextBilling}>
                Next billing: {new Date(sub.next_billing_date).toLocaleDateString()}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subscriptionsList: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  subscriptionCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  cost: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  subscriptionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 14,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  nextBilling: {
    fontSize: 14,
    color: '#6b7280',
  },
});