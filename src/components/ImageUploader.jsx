import React, { useRef, useState } from 'react';
import {
  Box,
  Button,
  Image,
  Input,
  VStack,
  Text,
  useToast,
  Progress,
  Icon,
  useColorModeValue,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { FiUpload, FiImage, FiX } from 'react-icons/fi';
import { supabase } from '../services/supabase';

const ImageUploader = ({ onUploadComplete, currentImageUrl = null }) => {
  const fileInputRef = useRef();
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const toast = useToast();
  
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Preview the image
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload the image
    setIsLoading(true);
    try {
      await onUploadComplete(file);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = async (event) => {
    try {
      setUploading(true);
      setError(null);
      const file = event.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('You must be authenticated to upload images');
      }

      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('book-covers')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          onUploadProgress: (progress) => {
            const percent = (progress.loaded / progress.total) * 100;
            setProgress(percent);
          },
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('book-covers')
        .getPublicUrl(filePath);

      // Call the callback with the public URL
      onUploadComplete(publicUrl);

      toast({
        title: 'Upload complete',
        description: 'Image has been uploaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error.message);
      toast({
        title: 'Upload failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <VStack spacing={4} width="100%">
      {error && (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      )}

      <Input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        display="none"
      />
      
      {previewUrl ? (
        <Box position="relative" width="100%">
          <Image
            src={previewUrl}
            alt="Preview"
            objectFit="cover"
            width="100%"
            height="200px"
            borderRadius="md"
          />
          <Button
            position="absolute"
            top={2}
            right={2}
            size="sm"
            colorScheme="red"
            onClick={handleRemoveImage}
            leftIcon={<Icon as={FiX} />}
          >
            Remove
          </Button>
        </Box>
      ) : (
        <Box
          width="100%"
          height="200px"
          border="2px dashed"
          borderColor={borderColor}
          borderRadius="md"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg={bgColor}
          cursor="pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <VStack spacing={2}>
            <Icon as={FiUpload} boxSize={6} />
            <Text>Click to upload image</Text>
          </VStack>
        </Box>
      )}

      {!previewUrl && (
        <Button
          onClick={() => fileInputRef.current?.click()}
          leftIcon={<Icon as={FiUpload} />}
          isLoading={isLoading}
        >
          Upload Image
        </Button>
      )}

      {uploading && (
        <Progress
          width="100%"
          value={progress}
          size="sm"
          colorScheme="blue"
          hasStripe
          isAnimated
        />
      )}
    </VStack>
  );
};

export default ImageUploader; 