import { COLORS } from '@/constants/Colors';
import { Comment as TComment } from '@/types/Comment.type';
import { formatTimestamp } from '@/utilities/dateUtils';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  comment: TComment;
}

export default function Comment({comment}: Props) {
  return (
    <View style={styles.commentRow}>
      <Image source={comment.author.profile_picture} style={styles.avatar} />
      <View style={{ flex: 1 }}>
        <Text style={styles.commentUsername}>
          {comment.author.username}{' '}
          <Text style={styles.commentText}>
            {comment.content}
          </Text>
        </Text>
        <Text style={styles.commentDatetime}>
          {formatTimestamp(comment.createdAt)}
        </Text>
      </View>
    </View>
  )
};

const styles = StyleSheet.create({
  commentRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    marginBottom: 12 
  },
  
  avatar: { 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    marginRight: 8 
  },
  
  commentUsername: { 
    fontWeight: 'bold', 
    color: COLORS.white 
  },
  
  commentText: { 
    fontWeight: 'normal', 
  },
  
  commentDatetime: { 
    fontSize: 12, 
    color: COLORS.gray 
  },
  
  inputRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 12 
  },
  
  input: {
    flex: 6,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 8,
    color: COLORS.white,
  },
});