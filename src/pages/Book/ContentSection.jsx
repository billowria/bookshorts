import React from 'react';
import { Box, Text, Divider, useColorModeValue, Alert, AlertIcon } from '@chakra-ui/react';
import DOMPurify from 'dompurify';

const ContentSection = ({ content, lastUpdated }) => {
  // Extract HTML content regardless of input type
  let htmlContent = '';
  
  if (content) {
    if (typeof content === 'string') {
      htmlContent = content;
    } else if (typeof content === 'object') {
      // If content is an object, try to get the 'content' property
      if (content.content) {
        htmlContent = content.content;
      } else {
        // If no content property, stringify the whole object (fallback)
        try {
          htmlContent = JSON.stringify(content, null, 2);
        } catch (e) {
          console.error('Failed to stringify content:', e);
          htmlContent = 'Error parsing content';
        }
      }
    } else {
      // For other types, convert to string
      htmlContent = String(content);
    }
  }
  
  // Sanitize HTML content to prevent XSS attacks
  const sanitizedContent = htmlContent ? DOMPurify.sanitize(htmlContent) : '';
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // If no content after processing, show a message
  if (!sanitizedContent.trim()) {
    return (
      <Alert status="info" borderRadius="md">
        <AlertIcon />
        No content available for this section.
      </Alert>
    );
  }

  return (
    <Box
      p={8}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      bg={bgColor}
      boxShadow="md"
      className="content-section"
    >
      {lastUpdated && (
        <Box mb={4}>
          <Text fontSize="sm" color="gray.500">
            Last updated: {lastUpdated.toLocaleDateString()}
          </Text>
          <Divider my={2} />
        </Box>
      )}
      
      <Box
        className="html-content"
        sx={{
          // Custom styling for HTML content
          'h1, h2, h3, h4, h5, h6': {
            fontWeight: 'bold',
            lineHeight: 1.2,
            mt: 4,
            mb: 2
          },
          h1: { fontSize: '2xl', mt: 6, mb: 4 },
          h2: { fontSize: 'xl', mt: 5, mb: 3 },
          h3: { fontSize: 'lg' },
          p: { mb: 4, lineHeight: 1.7 },
          ul: { pl: 6, mb: 4 },
          ol: { pl: 6, mb: 4 },
          li: { mb: 2 },
          a: { color: 'blue.500', textDecoration: 'underline' },
          blockquote: {
            borderLeftWidth: '4px',
            borderLeftColor: 'gray.300',
            pl: 4,
            py: 1,
            my: 4,
            fontStyle: 'italic'
          },
          img: {
            maxWidth: '100%',
            height: 'auto',
            borderRadius: 'md',
            my: 4
          },
          table: {
            width: '100%',
            borderCollapse: 'collapse',
            my: 4
          },
          'th, td': {
            borderWidth: '1px',
            borderColor: 'gray.200',
            p: 2
          },
          th: {
            bg: 'gray.50',
            fontWeight: 'bold'
          },
          pre: {
            bg: 'gray.50',
            p: 4,
            borderRadius: 'md',
            overflowX: 'auto',
            my: 4
          },
          code: {
            fontFamily: 'monospace',
            bg: 'gray.100',
            p: 1,
            borderRadius: 'sm'
          }
        }}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    </Box>
  );
};

export default ContentSection;
