import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { BlogPost as BlogPostType } from '@/hooks/useBlogPosts';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowLeft, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { sanitizeUrl } from '@/utils/security';
import { useSEO } from '@/hooks/useSEO';

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostType | null>(null);

  useSEO({
    title: post?.title,
    description: post?.subtitle || post?.content?.substring(0, 160),
    image: post?.featured_image_url,
    url: `/blog/${id}`,
    type: 'article',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('id', id)
          .eq('published', true)
          .single();

        if (error) throw error;
        setPost(data);
      } catch (error) {
        console.error('Error fetching post:', error);
        navigate('/blog');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.subtitle || post?.title,
          url,
        });
      } catch (error) {
        // User cancelled or error
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Skeleton className="h-8 w-32 mb-8" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <Skeleton className="h-80 w-full mb-8 rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">Post not found</h2>
        <Button asChild>
          <Link to="/blog">Back to Blog</Link>
        </Button>
      </div>
    );
  }

  // Function to render content with proper formatting
  const renderContent = (content: string) => {
    return content.split('\n').map((paragraph, index) => {
      if (!paragraph.trim()) return <br key={index} />;
      
      // Check for headings (lines starting with #)
      if (paragraph.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-semibold text-foreground mt-6 mb-3">{paragraph.slice(4)}</h3>;
      }
      if (paragraph.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-bold text-foreground mt-8 mb-4">{paragraph.slice(3)}</h2>;
      }
      if (paragraph.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold text-foreground mt-8 mb-4">{paragraph.slice(2)}</h1>;
      }
      
      // Check for bullet points
      if (paragraph.startsWith('- ') || paragraph.startsWith('• ')) {
        return (
          <li key={index} className="text-muted-foreground ml-6 mb-2 list-disc">
            {paragraph.slice(2)}
          </li>
        );
      }
      
      // Check for numbered lists
      const numberedMatch = paragraph.match(/^\d+\.\s/);
      if (numberedMatch) {
        return (
          <li key={index} className="text-muted-foreground ml-6 mb-2 list-decimal">
            {paragraph.slice(numberedMatch[0].length)}
          </li>
        );
      }
      
      // Regular paragraph
      return <p key={index} className="text-muted-foreground mb-4 leading-relaxed">{paragraph}</p>;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <article className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          asChild
          className="mb-8 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <Link to="/blog">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
        </Button>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
            {post.title}
          </h1>
          {post.subtitle && (
            <p className="text-xl text-muted-foreground mb-6">
              {post.subtitle}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {post.author_name}
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {format(new Date(post.published_at || post.created_at), 'MMMM d, yyyy')}
            </span>
            <Button variant="ghost" size="sm" onClick={handleShare} className="ml-auto">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </header>

        {/* Featured Image */}
        {post.featured_image_url && (
          <div className="mb-8 rounded-xl overflow-hidden">
            <img
              src={sanitizeUrl(post.featured_image_url)}
              alt={post.title}
              className="w-full h-auto max-h-[500px] object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          {renderContent(post.content)}
        </div>

        {/* Additional Images */}
        {post.additional_images && post.additional_images.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-foreground mb-4">Gallery</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {post.additional_images.map((imageUrl, index) => (
                <div key={index} className="rounded-lg overflow-hidden">
                  <img
                    src={sanitizeUrl(imageUrl)}
                    alt={`${post.title} - Image ${index + 1}`}
                    className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-border">
          <div className="flex items-center justify-between">
            <Button variant="outline" asChild>
              <Link to="/blog">
                <ArrowLeft className="w-4 h-4 mr-2" />
                More Articles
              </Link>
            </Button>
            <Button variant="ghost" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share this article
            </Button>
          </div>
        </footer>
      </article>
    </div>
  );
};

export default BlogPost;
