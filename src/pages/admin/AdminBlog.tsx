import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useBlogPosts, BlogPost } from '@/hooks/useBlogPosts';
import { Plus, Edit, Trash2, Eye, Upload, X, Image as ImageIcon, Search } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentResearch } from '@/components/admin/ContentResearch';

const AdminBlog = () => {
  const { posts, loading, fetchPosts, createPost, updatePost, deletePost, uploadImage } = useBlogPosts();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [published, setPublished] = useState(false);
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);

  useEffect(() => {
    fetchPosts(false); // Fetch all posts including unpublished
  }, []);

  const resetForm = () => {
    setTitle('');
    setSubtitle('');
    setContent('');
    setAuthorName('');
    setPublished(false);
    setFeaturedImage(null);
    setAdditionalImages([]);
    setEditingPost(null);
  };

  const openEditDialog = (post: BlogPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setSubtitle(post.subtitle || '');
    setContent(post.content);
    setAuthorName(post.author_name);
    setPublished(post.published);
    setFeaturedImage(post.featured_image_url);
    setAdditionalImages(post.additional_images || []);
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isFeature: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (8MB max)
    if (file.size > 8 * 1024 * 1024) {
      toast.error('Image size must be less than 8MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    try {
      setUploadingImage(true);
      const url = await uploadImage(file);
      
      if (isFeature) {
        setFeaturedImage(url);
      } else {
        setAdditionalImages([...additionalImages, url]);
      }
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(additionalImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim() || !authorName.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);

      const postData = {
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        content: content.trim(),
        author_name: authorName.trim(),
        published,
        featured_image_url: featuredImage,
        additional_images: additionalImages,
        published_at: published ? new Date().toISOString() : null
      };

      if (editingPost) {
        await updatePost(editingPost.id, postData);
      } else {
        await createPost(postData);
      }

      setIsDialogOpen(false);
      resetForm();
      fetchPosts(false);
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deletePost(id);
    fetchPosts(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Tabs defaultValue="posts" className="w-full">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Blog Management</h1>
              <p className="text-muted-foreground">Create and manage blog posts</p>
            </div>
            <TabsList>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="research" className="gap-2">
                <Search className="h-4 w-4" />
                Research
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="posts" className="mt-6">
            <div className="flex justify-end mb-4">
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter blog title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="author">Author Name *</Label>
                    <Input
                      id="author"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="Enter author name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle (Optional)</Label>
                  <Input
                    id="subtitle"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Enter a subtitle or summary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <p className="text-xs text-muted-foreground">
                    Use # for headings, - or • for bullet points, and blank lines for paragraphs
                  </p>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your blog content here...

# Main Heading
## Subheading

Regular paragraph text goes here.

- Bullet point 1
- Bullet point 2

1. Numbered item
2. Another item"
                    className="min-h-[300px] font-mono text-sm"
                    required
                  />
                </div>

                {/* Featured Image */}
                <div className="space-y-2">
                  <Label>Featured Image (Max 8MB)</Label>
                  {featuredImage ? (
                    <div className="relative inline-block">
                      <img
                        src={featuredImage}
                        alt="Featured"
                        className="h-32 w-auto rounded-lg object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => setFeaturedImage(null)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <label className="cursor-pointer">
                        <div className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg hover:bg-muted transition-colors">
                          <Upload className="h-4 w-4" />
                          <span className="text-sm">Upload Featured Image</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, true)}
                          disabled={uploadingImage}
                        />
                      </label>
                      {uploadingImage && <span className="text-sm text-muted-foreground">Uploading...</span>}
                    </div>
                  )}
                </div>

                {/* Additional Images */}
                <div className="space-y-2">
                  <Label>Additional Images (Max 8MB each)</Label>
                  <div className="flex flex-wrap gap-4">
                    {additionalImages.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Additional ${index + 1}`}
                          className="h-24 w-24 rounded-lg object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={() => removeAdditionalImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <label className="cursor-pointer">
                      <div className="h-24 w-24 flex flex-col items-center justify-center border border-dashed border-border rounded-lg hover:bg-muted transition-colors">
                        <ImageIcon className="h-6 w-6 text-muted-foreground mb-1" />
                        <span className="text-xs text-muted-foreground">Add Image</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, false)}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                </div>

                {/* Publish Toggle */}
                <div className="flex items-center gap-3">
                  <Switch
                    id="published"
                    checked={published}
                    onCheckedChange={setPublished}
                  />
                  <Label htmlFor="published">Publish immediately</Label>
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : editingPost ? 'Update Post' : 'Create Post'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
            </div>

            {/* Posts Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Blog Posts</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No blog posts yet. Create your first post!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Author</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {posts.map((post) => (
                          <TableRow key={post.id}>
                            <TableCell className="font-medium max-w-[300px]">
                              <div className="truncate">{post.title}</div>
                              {post.subtitle && (
                                <div className="text-sm text-muted-foreground truncate">{post.subtitle}</div>
                              )}
                            </TableCell>
                            <TableCell>{post.author_name}</TableCell>
                            <TableCell>
                              <Badge variant={post.published ? 'default' : 'secondary'}>
                                {post.published ? 'Published' : 'Draft'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {format(new Date(post.created_at), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                {post.published && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    asChild
                                  >
                                    <a href={`/blog/${post.id}`} target="_blank" rel="noopener noreferrer">
                                      <Eye className="h-4 w-4" />
                                    </a>
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditDialog(post)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{post.title}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(post.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
      
      <TabsContent value="research" className="mt-6">
        <ContentResearch />
      </TabsContent>
    </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminBlog;
