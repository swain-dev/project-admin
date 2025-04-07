import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Pagination,
  Stack,
  Skeleton,
  Alert,
  Switch,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import axiosInstance from 'src/utils/axios';

export default function NewsList() {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);

  const itemsPerPage = 10;

  // Fetch news data
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Create query params
        let queryParams = `?pagination[page]=${page}&pagination[pageSize]=${itemsPerPage}&sort=publish_date:desc`;
        
        if (search) {
          queryParams += `&filters[title][$containsi]=${search}`;
        }
        
        const response = await axiosInstance.get(`/news${queryParams}`);
        
        console.log('News response:', response);
        
        if (response.data) {
          setNews(response.data || []);
          setTotalPages(response.data.meta?.pagination?.pageCount || 1);
        }
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Không thể tải danh sách bài viết. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [page, search]);

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Handle search change
  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1); // Reset to first page when searching
  };

  // Navigate to create form
  const handleCreateArticle = () => {
    navigate('/blog/create');
  };

  // Navigate to edit form
  const handleEditArticle = (id) => {
    navigate(`/blog/edit/${id}`);
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (article) => {
    setArticleToDelete(article);
    setDeleteDialogOpen(true);
  };

  // Close delete dialog
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setArticleToDelete(null);
  };

  // Confirm and delete article
  const handleDeleteConfirm = async () => {
    if (!articleToDelete) return;
    
    try {
      await axiosInstance.delete(`/news/${articleToDelete.documentId}`);
      
      // Update the news list by removing the deleted article
      setNews(news.filter(article => article.id !== articleToDelete.id));
      
      setSuccess(`Bài viết "${articleToDelete.title}" đã được xóa thành công.`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Error deleting article:', err);
      setError('Không thể xóa bài viết. Vui lòng thử lại sau.');
    } finally {
      handleDeleteDialogClose();
    }
  };

  // Toggle featured status
  const handleToggleFeatured = async (id, currentStatus) => {
    try {
      await axiosInstance.put(`/news/${id}`, {
        data: {
          featured_article: !currentStatus
        }
      });
      
      // Update the local state to reflect the change
      setNews(news.map(article => {
        if (article.id === id) {
          return {
            ...article,
            featured_article: !currentStatus
          };
        }
        return article;
      }));
      
      setSuccess('Cập nhật trạng thái bài viết nổi bật thành công.');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Error updating featured status:', err);
      setError('Không thể cập nhật trạng thái bài viết nổi bật.');
    }
  };

  // View article details
  const handleViewArticle = (id) => {
    // Replace with your public article viewing route
    window.open(`/news/${id}`, '_blank');
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Truncate text for display
  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength 
      ? `${text.substring(0, maxLength)}...` 
      : text;
  };

  // Check if cover image exists safely
  const hasCoverImage = (article) => {
    return article?.cover_image != null;
  };

  // Render table skeleton during loading
  const renderSkeletonRows = () => {
    return Array(itemsPerPage).fill(0).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="rectangular" width={40} height={24} /></TableCell>
        <TableCell><Skeleton variant="rectangular" width={120} /></TableCell>
      </TableRow>
    ));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 0, mb: 0 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Quản lý tin tức
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateArticle}
        >
          Thêm bài viết mới
        </Button>
      </Box>

      {/* Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Search bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm bài viết theo tiêu đề..."
          value={search}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Articles table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tiêu đề</TableCell>
              <TableCell>Tóm tắt</TableCell>
              <TableCell>Ngày xuất bản</TableCell>
              <TableCell>Lượt xem</TableCell>
              <TableCell>Nổi bật</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              renderSkeletonRows()
            ) : news.length > 0 ? (
              news.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {hasCoverImage(article) && (
                        <Tooltip title="Có ảnh bìa">
                          <ImageIcon 
                            color="primary" 
                            fontSize="small"
                            sx={{ mr: 1 }} 
                          />
                        </Tooltip>
                      )}
                      {truncateText(article.title, 60)}
                    </Box>
                  </TableCell>
                  <TableCell>{truncateText(article.summary, 80)}</TableCell>
                  <TableCell>{formatDate(article.publish_date)}</TableCell>
                  <TableCell>{article.view_count || 0}</TableCell>
                  <TableCell>
                    <Switch
                      checked={Boolean(article.featured_article)}
                      onChange={() => handleToggleFeatured(article.documentId, article.featured_article)}
                      color="primary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Xem bài viết">
                        <IconButton 
                          size="small" 
                          color="info"
                          onClick={() => handleViewArticle(article.documentId)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sửa bài viết">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleEditArticle(article.documentId)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa bài viết">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteClick(article)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Không tìm thấy bài viết nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange} 
            color="primary" 
          />
        </Box>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Xác nhận xóa bài viết</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa bài viết "{articleToDelete?.title}"?
            Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="primary">
            Hủy bỏ
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}