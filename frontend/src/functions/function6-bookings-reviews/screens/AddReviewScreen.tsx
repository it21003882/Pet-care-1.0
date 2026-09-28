/**
 * functions/function6-bookings-reviews/screens/AddReviewScreen.tsx
 * Owner: Function 6 — Service Bookings & Reviews
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../types/navigation';
import reviewService from '../services/reviewService';
import colors from '../../../constants/colors';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';

type RouteProps = RouteProp<RootStackParamList, 'AddReview'>;
type NavProp = StackNavigationProp<RootStackParamList>;

export const AddReviewScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const { serviceId, vetId, title } = route.params;

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      Alert.alert('Invalid Rating', 'Please select a star rating between 1 and 5.');
      return;
    }

    try {
      setSubmitting(true);
      await reviewService.createReview({
        serviceId: serviceId || undefined,
        veterinarianId: vetId || undefined,
        rating,
        comment: comment.trim() || undefined,
      });

      Alert.alert('Review Submitted', 'Thank you for your valuable feedback!', [
        { text: 'Done', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Submission Error', err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.targetCard}>
        <Text style={styles.targetLabel}>Reviewing</Text>
        <Text style={styles.targetTitle}>{title || (serviceId ? 'Pet Service' : 'Veterinarian')}</Text>
      </Card>

      <Text style={styles.heading}>Your Rating</Text>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starBtn}
          >
            <Text style={[styles.starText, rating >= star && styles.starActive]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.ratingText}>
        {rating === 5 ? 'Excellent!' : rating === 4 ? 'Very Good' : rating === 3 ? 'Average' : rating === 2 ? 'Poor' : 'Terrible'}
      </Text>

      <Text style={styles.heading}>Feedback & Comments</Text>
      <Input
        placeholder="Share details about your experience, customer service, or pet care quality..."
        value={comment}
        onChangeText={setComment}
        multiline
        numberOfLines={4}
      />

      <Button
        title="Submit Review"
        onPress={handleSubmit}
        loading={submitting}
        style={styles.submitBtn}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  targetCard: { padding: 16, marginBottom: 16, alignItems: 'center' },
  targetLabel: { fontSize: 12, color: colors.textSecondary, textTransform: 'uppercase', fontWeight: '600' },
  targetTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 4 },
  heading: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 12, marginBottom: 8 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginVertical: 12 },
  starBtn: { padding: 4 },
  starText: { fontSize: 40, color: colors.border },
  starActive: { color: colors.accent },
  ratingText: { textAlign: 'center', fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 16 },
  submitBtn: { marginTop: 16 },
});

export default AddReviewScreen;
