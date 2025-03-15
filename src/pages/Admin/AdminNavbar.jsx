import { Box, Flex, Button } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const AdminNavbar = () => {
  return (
    <Box bg="gray.800" px={4} py={3}>
      <Flex maxW="container.xl" mx="auto" justify="space-between" align="center">
        <Button as={RouterLink} to="/admin" colorScheme="blue">
          Dashboard
        </Button>
        <Flex gap={4}>
          <Button as={RouterLink} to="/admin/content" variant="ghost" color="white">
            Content
          </Button>
          <Button as={RouterLink} to="/admin/analytics" variant="ghost" color="white">
            Analytics
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default AdminNavbar;