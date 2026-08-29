import { AnimatedPressable } from "@/components/AnimatedPressable";
import { COLORS } from "@/constants/Colors";
import { FONTS } from "@/constants/Fonts";
import { postsService } from "@/services/postsService";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useIsFocused } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";

import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { z } from "zod";

const schema = z.object({
  caption: z.string().min(1, "Caption is required"),
  image: z.string().min(1, "Image is required"),
});

type FormData = z.infer<typeof schema>;

export default function CreatePostScreen() {
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();
  const isFocused = useIsFocused();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { caption: "", image: "" },
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
      aspect: [3, 2],
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setValue("image", asset.uri ?? "");
      setPreviewUri(asset.uri ?? null);
    }
  };

  // Reset form when screen loses focus (navigated away) or unmounts
  // This ensures caption and selected image are cleared when returning to this screen
  useEffect(() => {
    if (!isFocused) {
      // reset form values and validation state
      reset({ caption: "", image: "" });
      setPreviewUri(null);
      setLoading(false);
    }

    return () => {
      // also clean up on unmount
      reset({ caption: "", image: "" });
      setPreviewUri(null);
      setLoading(false);
    };
    // include reset in deps to satisfy linter rules
  }, [isFocused, reset]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const formData = new FormData();

    // Use field names that match backend model (Caption, Image)
    formData.append("Caption", data.caption);
    if (data.image) {
      formData.append("Image", {
        uri: data.image,
        name: "photo.jpg",
        type: "image/jpeg",
      } as any);
    }

    try {
      await postsService.createPost(formData);
      // Invalidates both the feed ("posts") and any author-specific post lists
      // ("posts", "author", id), since react-query matches by key prefix.
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      router.back();
    }
    catch (err) {
      console.error("Error:", err);
    } 
    finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={styles.header}>
        <AnimatedPressable onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.lightBlueX2} />
        </AnimatedPressable>
        <Text style={styles.headerTitle}>Create Post</Text>
        <AnimatedPressable style={styles.publishButton} onPress={handleSubmit(onSubmit)}>
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.publishText}>Publish</Text>
          )}
        </AnimatedPressable>
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Controller
          control={control}
          name="caption"
          render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Write your caption..."
                placeholderTextColor={COLORS.gray}
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={4}
              />
          )}
        />
        {errors.caption && <Text style={styles.error}>{errors.caption.message}</Text>}

        <AnimatedPressable style={styles.imagePicker} onPress={pickImage}>
          {previewUri ? (
            <Image source={{ uri: previewUri }} style={styles.image} />
          ) : (
            <View style={styles.placeholderContent}>
              <MaterialIcons name="photo-camera" size={36} color={COLORS.gray} />
              <Text style={styles.placeholderText}>Select image</Text>
            </View>
          )}
        </AnimatedPressable>
        {errors.image && <Text style={styles.error}>{errors.image.message}</Text>}
      </ScrollView>
    </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray,
    backgroundColor: COLORS.darkBlue,
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitle: {
    fontFamily: FONTS.jetBrainsMono,
    fontSize: 18,
    color: COLORS.lightBlueX2,
  },

  publishButton: {
    backgroundColor: COLORS.lightBlueX2,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  publishText: {
    color: COLORS.white,
    fontFamily: FONTS.spaceMono,
  },

  container: {
    padding: 20,
    backgroundColor: COLORS.darkBlue,
    gap: 12,
  },

  input: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.gray,
    fontFamily: FONTS.spaceMono,
    textAlignVertical: "top",
  },

  imagePicker: {
    marginTop: 8,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.gray,
    backgroundColor: COLORS.white,
    height: 320,
    alignItems: "center",
    justifyContent: "center",
  },

  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  placeholderContent: {
    alignItems: "center",
    justifyContent: "center",
  },

  placeholderText: {
    color: COLORS.gray,
    marginTop: 8,
    fontFamily: FONTS.spaceMono,
  },

  error: {
    color: COLORS.red,
    fontSize: 13,
    marginTop: 6,
  },
});