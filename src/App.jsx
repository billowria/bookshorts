import React from 'react';
import { ChakraProvider, Box, VStack, Heading, SimpleGrid, Button } from '@chakra-ui/react';
import { Routes, Route, Navigate } from 'react-router-dom';
import theme from './theme';
import adminTheme from './theme/adminTheme';
import userTheme from './theme/userTheme';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { useScrollToTop } from './hooks/useScrollToTop';
import { AuthProvider } from './hooks/useAuth.jsx';
import { Link as RouterLink } from 'react-router-dom';

// Import Likhari components from the new directory
import LikhariHome from '../likhari/pages/index';
import LikhariRouter from '../likhari/pages/LikhariRouter';

// User pages
import Home from './pages/Home';
import BookPage from './pages/Book';
import BookDetails from './pages/BookDetails';
import CategoryBooks from './pages/CategoryBooks';
import Login from './pages/Login';
import UserProfile from './pages/UserProfile';
import AllBooks from './pages/AllBooks';

// Admin pages
import BookManager from './pages/Admin/BookManager';
import ContentManager from './pages/Admin/ContentManager';
import Analytics from './pages/Admin/Analytics';
import NoMatch from './pages/Admin/NoMatch';
import Dashboard from './pages/Admin/Dashboard';
import ApprovalManager from './pages/Admin/ApprovalManager';

// Components
import Navbar from './components/Navbar';
  
// Create a ScrollToTop component
function ScrollToTop() {
  useScrollToTop();
  return null;
}

// Add this component at the top level with other components
const WriteIndex = () => (
  <Box p={8} textAlign="center">
    <VStack spacing={8}>
      <Heading>What would you like to write?</Heading>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} width="100%" maxW="800px">
        <Button
          as={RouterLink}
          to="/likhari/write/book"
          size="lg"
          height="200px"
          colorScheme="brand"
          variant="outline"
        >
          Write a Book
        </Button>
        <Button
          as={RouterLink}
          to="/likhari/write/shayari"
          size="lg"
          height="200px"
          colorScheme="brand"
          variant="outline"
        >
          Write a Shayari
        </Button>
      </SimpleGrid>
    </VStack>
  </Box>
);

const App = () => {
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  const isLikhariRoute = window.location.pathname.startsWith('/likhari');

  return (
    <AuthProvider>
      <ChakraProvider theme={isAdminRoute ? adminTheme : isLikhariRoute ? theme : userTheme}>
        <ScrollToTop />
        <Box minH="100vh">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/books" element={<AllBooks />} />

            {/* User Routes */}
            <Route path="/" element={<Home />} />
            <Route path="book/:bookId" element={<BookPage />} />
            <Route path="book/:bookId/details" element={<BookDetails />} />
            <Route path="category/:categoryId" element={<CategoryBooks />} />
            {/* Likhari Portal Routes */}
            <Route path="/likhari/*" element={<LikhariRouter />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/books"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <BookManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/content"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <ContentManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/approvals"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <ApprovalManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Analytics />
                </ProtectedRoute>
              }
            />

            

            {/* Error Handling */}
            <Route path="/404" element={<NoMatch />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Box>
      </ChakraProvider>
    </AuthProvider>
  );
};

export default App;