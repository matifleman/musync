import { COLORS } from '@/constants/Colors';
import { useAddComment } from '@/hooks/useAddComment';
import { useComments } from '@/hooks/useComments';
import { useDeleteComment } from '@/hooks/useDeleteComment';
import { useSession } from '@/contexts/AuthContext';
import { Comment as TComment } from '@/types/Comment.type';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { BlurView } from 'expo-blur';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { AnimatedPressable } from './AnimatedPressable';
import Comment from "./Comment";

type Props = {
  isVisible: boolean;
  onClose: () => void;
  postId: number;
  // Needed for the delete rule: a post's author can remove anyone's comment on it.
  postAuthorId: number;
};

export default function CommentsModal({ isVisible, onClose, postId, postAuthorId }: Props) {
  const { currentUser } = useSession();
  const [newComment, setNewComment] = useState<string>('');

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useComments(postId);
  const addComment = useAddComment(postId);
  const deleteComment = useDeleteComment(postId);

  // Same dedupe as the feed: offset paging can repeat a row when someone comments
  // while another reader is paging back through the older comments.
  const comments = useMemo(() => {
    const seen = new Set<number>();
    return (data?.pages.flat() ?? []).filter((comment) => {
      if (seen.has(comment.id)) return false;
      seen.add(comment.id);
      return true;
    });
  }, [data]);

  const canDelete = (comment: TComment) =>
    !!currentUser && (currentUser.id === comment.author.id || currentUser.id === postAuthorId);

  const handleAddComment = () => {
    const text = newComment.trim();
    // Guarded here rather than with a disabled prop: AnimatedPressable doesn't take one.
    if (text === '' || addComment.isPending) return;

    addComment.mutate(text, {
      onSuccess: () => setNewComment(''),
      onError: (mutationError) =>
        Toast.show({
          type: 'error',
          text1: 'Could not post comment',
          text2: mutationError instanceof Error ? mutationError.message : undefined,
        }),
    });
  };

  const handleLongPress = (comment: TComment) => {
    if (!canDelete(comment)) return;

    Alert.alert('Delete comment?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          deleteComment.mutate(comment.id, {
            onError: (mutationError) =>
              Toast.show({
                type: 'error',
                text1: 'Could not delete comment',
                text2: mutationError instanceof Error ? mutationError.message : undefined,
              }),
          }),
      },
    ]);
  };

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  const renderList = () => {
    if (isLoading) return <ActivityIndicator color={COLORS.lightBlueX2} style={styles.listState} />;
    if (error) return <Text style={styles.listStateText}>Could not load comments</Text>;
    if (comments.length === 0) return <Text style={styles.listStateText}>No comments yet</Text>;

    return (
      <FlatList
        data={comments}
        // Newest at the bottom, so the modal opens on the newest comment and
        // scrolling up walks into older pages. This also flips the footer to the
        // visual top, which is exactly where "loading older" belongs.
        inverted
        keyExtractor={(item: TComment) => item.id.toString()}
        showsVerticalScrollIndicator
        renderItem={({ item }: { item: TComment }) => (
          // Plain Pressable, not AnimatedPressable: that one wires onPress to
          // onTouchEnd and has no onLongPress, so a long press would fire both.
          <Pressable onLongPress={() => handleLongPress(item)} delayLongPress={300}>
            <Comment comment={item} />
          </Pressable>
        )}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator color={COLORS.lightBlueX2} /> : null}
        keyboardShouldPersistTaps="handled"
      />
    );
  };

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
            {renderList()}
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
                  {addComment.isPending ? (
                    <ActivityIndicator size="small" color={COLORS.lightBlueX2} />
                  ) : (
                    <FontAwesome name="send" size={20} color={COLORS.lightBlueX2} />
                  )}
                </AnimatedPressable>
              </View>
            </View>
          </View>
      </KeyboardAvoidingView>
    </Modal>
  )
};

const styles = StyleSheet.create({  
  blurredOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
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
  },

  listState: {
    marginVertical: 24,
  },

  listStateText: {
    color: COLORS.gray,
    textAlign: 'center',
    marginVertical: 24,
  }
});
