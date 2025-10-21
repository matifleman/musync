import { COLORS } from '@/constants/Colors';
import { dummyComments } from '@/data/dummyComments';
import { dummyUsers } from '@/data/dummyUsers';
import { Comment as TComment } from '@/types/Comment.type';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { BlurView } from 'expo-blur';
import React, { useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable';
import Comment from "./Comment";

type Props = {
  isVisible: boolean;
  onClose: () => void;
};

export default function CommentsModal({isVisible, onClose}: Props) {
  const [newComment, setNewComment] = useState<string>('');
  const [comments, setComments] = useState<TComment[]>(dummyComments)
  const postsList = useRef<FlatList>(null);

  const handleAddComment = () => {
    if (newComment.trim() === '') return;
    
    const newObj: TComment = {
      id: comments.length + 1,
      author: dummyUsers[0],
      content: newComment,
      createdAt: new Date().toISOString(),
    };

    setComments([...comments, newObj]);
    setNewComment('');
  };

  const scrollPostListToEnd = () => postsList.current?.scrollToEnd({animated: true});

  if (!isVisible) return null;

  return ( 
    <Modal
      onRequestClose={onClose}
      animationType='slide'
      visible={isVisible}
      transparent
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
        <BlurView style={styles.blurredOverlay} intensity={20} onTouchEnd={onClose} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comments</Text>
              <AnimatedPressable onPress={onClose}>
                <AntDesign name="close-circle" size={22} color={COLORS.lightBlueX2} />
              </AnimatedPressable>
            </View>
            <FlatList
              ref={postsList}
              data={comments}
              keyExtractor={(item: TComment) => item.id.toString()}
              showsVerticalScrollIndicator
              renderItem={({ item }: {item: TComment}) => <Comment comment={item} />}
              onContentSizeChange={scrollPostListToEnd}
              keyboardShouldPersistTaps="handled"
            />
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Type a comment..."
                placeholderTextColor={COLORS.gray}
                value={newComment}
                onChangeText={setNewComment}
                multiline
                numberOfLines={1}
              />
              <View style={{flex: 1}}>
                <AnimatedPressable style={styles.sendButton} onPress={handleAddComment}>
                  <FontAwesome name="send" size={20} color={COLORS.lightBlueX2} />
                </AnimatedPressable>
              </View>
            </View>
          </View>
        {/* </BlurView> */}
      </KeyboardAvoidingView>
    </Modal>
  )
};

const styles = StyleSheet.create({  
  blurredOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    // height: "auto"
  },
  
  modalContent: {
    backgroundColor: COLORS.black,
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "70%",
  },
  
  modalTitle: {
    fontSize: 18, 
    marginBottom: 12, 
    fontWeight: 'bold', 
    color: COLORS.white,
  },
  
  inputRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 12,
    marginBottom: 20,
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

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8
  },

  sendButton: {
    alignItems: "center",
    justifyContent: "center",
  }
});
