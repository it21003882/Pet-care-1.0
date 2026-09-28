/**
 * components/common/PetAvatar.tsx
 * Reusable Pet Avatar with Default Icon Fallback (Zero Broken Images)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import colors from '../../constants/colors';
import { config } from '../../constants/config';
import { PawPrint } from 'lucide-react-native';

interface PetAvatarProps {
  imageUrl?: string | null;
  image?: string | null;
  name?: string;
  species?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
}

export const PetAvatar: React.FC<PetAvatarProps> = ({
  imageUrl,
  image,
  name = '',
  species = '',
  size = 64,
  style,
  borderRadius,
}) => {
  const [imageError, setImageError] = useState(false);

  // Use imageUrl or image reference
  const rawUrl = imageUrl || image || null;

  // Resolve relative backend URL (e.g. /uploads/file-123.jpg)
  const resolveUri = (url: string | null): string | null => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('file://')) {
      return url;
    }
    // Remove trailing /api from apiUrl if present to get host root
    const baseUrl = config.apiUrl.replace(/\/api\/?$/, '');
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const finalUri = resolveUri(rawUrl);

  // Determine friendly species emoji icon or null for vector PawPrint
  const getSpeciesEmoji = (spec: string): string | null => {
    const s = spec.toLowerCase().trim();
    if (s.includes('dog') || s.includes('puppy') || s.includes('canine')) return '🐶';
    if (s.includes('cat') || s.includes('kitten') || s.includes('feline')) return '🐱';
    if (s.includes('bird') || s.includes('parrot')) return '🦜';
    if (s.includes('rabbit') || s.includes('bunny')) return '🐰';
    if (s.includes('hamster') || s.includes('guinea')) return '🐹';
    if (s.includes('fish')) return '🐠';
    if (s.includes('turtle') || s.includes('reptile')) return '🐢';
    return null;
  };

  const effectiveRadius = borderRadius !== undefined ? borderRadius : size / 2;
  const emojiSize = Math.max(18, Math.round(size * 0.45));
  const speciesEmoji = getSpeciesEmoji(species);

  if (finalUri && !imageError) {
    return (
      <View
        style={[
          styles.container,
          { width: size, height: size, borderRadius: effectiveRadius },
          style,
        ]}
      >
        <Image
          source={{ uri: finalUri }}
          style={{ width: size, height: size, borderRadius: effectiveRadius }}
          onError={() => setImageError(true)}
          resizeMode="cover"
        />
      </View>
    );
  }

  // Default avatar when no photo or photo fails to load
  return (
    <View
      style={[
        styles.container,
        styles.defaultAvatar,
        {
          width: size,
          height: size,
          borderRadius: effectiveRadius,
        },
        style,
      ]}
    >
      {speciesEmoji ? (
        <Text style={{ fontSize: emojiSize }}>{speciesEmoji}</Text>
      ) : (
        <PawPrint size={Math.round(size * 0.48)} color={colors.primary} />
      )}
      {size >= 70 && name ? (
        <Text style={styles.nameInitial} numberOfLines={1}>
          {name.charAt(0).toUpperCase()}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultAvatar: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  nameInitial: {
    position: 'absolute',
    bottom: 4,
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    backgroundColor: colors.surface,
    paddingHorizontal: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
});

export default PetAvatar;
