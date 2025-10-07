import { COLORS } from '@/constants/Colors';
import { dummyComments } from '@/data/dummyComments';
import { dummyUsers } from '@/data/dummyUsers';
import { Comment as TComment } from '@/types/Comment.type';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import Modal from 'react-native-modal';
import { AnimatedPressable } from './AnimatedPressable';
import Comment from './Comment';

type Props = {
  isVisible: boolean;
  onClose: () => void;
};

export default function CommentsModal({isVisible, onClose}: Props) {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<TComment[]>
  (dummyComments);
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

  return (
    <Modal
      isVisible={isVisible}
      onSwipeComplete={onClose}
      // swipeDirection="down"
      // animationOut="slideOutDown"
      style={styles.modal}
      hasBackdrop={false}
    >
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Comentarios</Text>
          <AnimatedPressable onPress={onClose}>
            <AntDesign name="close-circle" size={22} color={COLORS.lightBlueX2} />
          </AnimatedPressable>
        </View>
        
        <FlatList
          ref={postsList}
          contentContainerStyle={{}}
          data={comments}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={true}
          renderItem={({ item }) => <Comment comment={item} />}
          onContentSizeChange={scrollPostListToEnd}
        />

        <View style={styles.inputRow} >
          <TextInput
            style={styles.input}
            placeholder="Escribe un comentario..."
            placeholderTextColor={COLORS.gray}
            value={newComment}
            onChangeText={setNewComment}
            multiline
            numberOfLines={1}
            textAlignVertical='center'
          />
          <View style={{flex: 1}}>
          <AnimatedPressable style={styles.sendButton} onPress={handleAddComment}>
            <FontAwesome name="send" size={20} color={COLORS.lightBlueX2} />
          </AnimatedPressable>
          </View>
        </View>
      </View>
    </Modal>
  )
};

const styles = StyleSheet.create({  
  modal: { 
    justifyContent: 'flex-end',
    margin: 0,
  },
  
  modalContent: {
    flex: 1,
    backgroundColor: COLORS.black,
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%'
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

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8
  },

  sendButton: {
    flex: 1,
    alignItems: "center",
  }
});
