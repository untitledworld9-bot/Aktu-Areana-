import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Flame, 
  Sparkles, 
  HelpCircle, 
  BookOpen, 
  Coffee, 
  Code, 
  ThumbsUp, 
  ThumbsDown, 
  Share2, 
  Bookmark, 
  BookmarkCheck,
  Send, 
  Image as ImageIcon, 
  Upload,
  Tag, 
  Plus, 
  X, 
  Trash2, 
  Check, 
  Copy, 
  Search, 
  Filter, 
  ShieldCheck, 
  Crown, 
  School,
  ExternalLink,
  MessageCircle,
  Pin,
  TrendingUp,
  Clock,
  Zap,
  MoreVertical,
  Heart,
  Edit3,
  Eye,
  User,
  Reply,
  CornerDownRight,
  AlertTriangle
} from 'lucide-react';
import { useArena } from '../context/ArenaContext';
import { CommunityPost, CommunityComment, UserRole } from '../types';
import { PullToRefresh } from './ui/PullToRefresh';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  increment, 
  arrayUnion, 
  arrayRemove,
  getDocs,
  where,
  limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { playNotificationChime } from '../utils/audioChime';
import { 
  generateThreadJsonLd, 
  generateFeedJsonLd, 
  injectStructuredDataToHead, 
  updateThreadMetaTags 
} from '../utils/communitySeo';

type FeedFilter = 'trending' | 'latest' | 'my_posts' | 'doubt' | 'notes' | 'meme' | 'showcase';

interface CommunityViewProps {
  onOpenAuth?: (mode?: 'login' | 'register') => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({ onOpenAuth }) => {
  const { user, profile, isAdmin, isMasterAdmin } = useArena();
  
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FeedFilter>('trending');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [targetedPostId, setTargetedPostId] = useState<string | null>(null);

  // Track unique post views
  const viewedPostsRef = useRef<Set<string>>(new Set());

  // Edit Post Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState<CommunityPost['category']>('discussion');
  const [editTagInput, setEditTagInput] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editImageUrl, setEditImageUrl] = useState('');
  const [hasEditCodeSnippet, setHasEditCodeSnippet] = useState(false);
  const [editCodeLanguage, setEditCodeLanguage] = useState('c');
  const [editCodeContent, setEditCodeContent] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);
  
  // Create Post Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<CommunityPost['category']>('discussion');
  const [newTagInput, setNewTagInput] = useState('');
  const [newTags, setNewTags] = useState<string[]>(['AKTU']);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [hasCodeSnippet, setHasCodeSnippet] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState('c');
  const [codeContent, setCodeContent] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);
  
  // Expanded comments per post & nested reply targeting
  const [expandedComments, setExpandedComments] = useState<{ [postId: string]: boolean }>({});
  const [postComments, setPostComments] = useState<{ [postId: string]: CommunityComment[] }>({});
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [submittingComment, setSubmittingComment] = useState<{ [postId: string]: boolean }>({});
  const [replyingTo, setReplyingTo] = useState<{
    [postId: string]: { commentId: string; authorName: string; authorUid: string } | null;
  }>({});
  
  // Saved / Bookmarked posts in session
  const [savedPostIds, setSavedPostIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('aktu_saved_posts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const postFileInputRef = useRef<HTMLInputElement | null>(null);
  const commentUnsubsRef = useRef<{ [postId: string]: () => void }>({});

  const handlePostImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Image file is too large. Please select an image under 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setNewImageUrl(dataUrl);
        } else {
          setNewImageUrl(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // 1. Real-time subscribe to community posts from Firestore
  useEffect(() => {
    // Dynamic SEO update for Community feed
    const prevTitle = document.title;
    document.title = 'AKTU Community — Exam Doubts, Solved Notes & PYQ Discussions | AKTU Arena';
    
    const metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc ? metaDesc.getAttribute('content') : '';
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Explore real student discussions, solved engineering doubts, handwritten notes, and AKTU B.Tech 1st year PYQs across 750+ colleges in UP.'
      );
    }

    setLoading(true);
    const postsQuery = query(
      collection(db, 'community_posts'),
      orderBy('createdAt', 'desc'),
      limit(60)
    );

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const postsMap = new Map<string, CommunityPost>();
      snapshot.forEach((docSnap) => {
        postsMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() } as CommunityPost);
      });
      const fetched = Array.from(postsMap.values());

      // Seed initial sample engineering posts if collection is completely fresh
      if (fetched.length === 0 && !snapshot.metadata.hasPendingWrites) {
        seedInitialCommunityPosts();
      } else {
        setPosts(fetched);

        // Server-Side-Ready Structured Data for Google Discussion Forum Indexing
        try {
          const feedSchema = generateFeedJsonLd(fetched);
          injectStructuredDataToHead('community-discussion-schema', feedSchema);
        } catch (err) {
          console.warn('Community SEO schema notice:', err);
        }

        // Deep-linking: Check if URL targets a specific post
        try {
          const urlParams = new URLSearchParams(window.location.search);
          let targetId = urlParams.get('post');
          if (!targetId && window.location.hash) {
            const hash = window.location.hash;
            const qIdx = hash.indexOf('?');
            if (qIdx !== -1) {
              const hashParams = new URLSearchParams(hash.slice(qIdx));
              targetId = hashParams.get('post');
            } else if (hash.includes('post=')) {
              targetId = hash.split('post=')[1]?.split('&')[0];
            } else if (hash.startsWith('#community-')) {
              targetId = hash.replace('#community-', '');
            }
          }

          if (targetId) {
            setTargetedPostId(targetId);
            const targeted = fetched.find((p) => p.id === targetId);
            if (targeted) {
              setExpandedComments((prev) => ({ ...prev, [targetId!]: true }));
              updateThreadMetaTags(targeted);
              setTimeout(() => {
                const el = document.getElementById(`community-${targetId}`) || document.getElementById(`post-${targetId}`);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }, 450);
              setTimeout(() => {
                setTargetedPostId(null);
              }, 4500);
            }
          }
        } catch (e) {}
      }
      setLoading(false);
    }, (error) => {
      console.warn('Firestore community subscription note:', error.message);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      document.title = prevTitle;
      if (metaDesc && prevDesc) {
        metaDesc.setAttribute('content', prevDesc);
      }
    };
  }, []);

  // Live unique view tracking for community posts
  useEffect(() => {
    if (posts.length === 0) return;

    let visitorId = user?.uid;
    if (!visitorId) {
      visitorId = localStorage.getItem('aktu_viewer_uid') || '';
      if (!visitorId) {
        visitorId = 'visitor_' + Math.random().toString(36).slice(2, 10);
        localStorage.setItem('aktu_viewer_uid', visitorId);
      }
    }

    posts.forEach((post) => {
      if (!post.id || viewedPostsRef.current.has(post.id)) return;
      const sessionKey = `aktu_viewed_p_${post.id}`;
      if (sessionStorage.getItem(sessionKey)) {
        viewedPostsRef.current.add(post.id);
        return;
      }
      sessionStorage.setItem(sessionKey, 'true');
      viewedPostsRef.current.add(post.id);

      const alreadyRecorded = (post.viewedBy || []).includes(visitorId!);
      if (!alreadyRecorded) {
        const postRef = doc(db, 'community_posts', post.id);
        updateDoc(postRef, {
          viewsCount: increment(1),
          viewedBy: arrayUnion(visitorId),
        }).catch(() => {});
      }
    });
  }, [posts, user?.uid]);

  // Seed sample community posts for AKTU B.Tech 1st Year
  const seedInitialCommunityPosts = async () => {
    try {
      const initialSeed: Omit<CommunityPost, 'id'>[] = [
        {
          authorUid: 'admin_aktu',
          authorName: 'AKTU Arena Editorial',
          authorRole: 'admin',
          authorBranch: 'CSE',
          authorCollege: 'AKTU Central Board',
          title: '🔥 Welcome to the Official AKTU Engineering Community!',
          content: 'This space is built for all Dr. A.P.J. Abdul Kalam Technical University B.Tech 1st Year scholars across 750+ colleges. Share your unit notes, clear engineering maths & C-programming doubts, post relatable college memes, and form 1v1 battle teams!',
          category: 'discussion',
          tags: ['Welcome', 'AKTU2026', 'Engineering', 'Rules'],
          upvotesCount: 42,
          downvotesCount: 0,
          upvotedBy: [],
          downvotedBy: [],
          reactions: { fire: ['admin_aktu'], rocket: ['admin_aktu'] },
          commentsCount: 3,
          isPinned: true,
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        },
        {
          authorUid: 'student_vikram',
          authorName: 'Vikramaditya Sharma',
          authorRole: 'student',
          authorBranch: 'CSE (AI & ML)',
          authorCollege: 'IET Lucknow',
          title: '💡 Quick Trick for Engineering Chemistry Unit 2 (Spectroscopy)',
          content: 'Guys, for UV-Visible spectroscopy, remember Woodward-Fieser rules: Base value for heteroannular diene is 214 nm, and homoannular is 253 nm. Each conjugated double bond adds +30 nm. Guaranteed 7-mark question in AKTU end-sem!',
          category: 'notes',
          tags: ['Chemistry', 'Unit2', 'ExamTrick', 'PYQ'],
          upvotesCount: 28,
          downvotesCount: 1,
          upvotedBy: [],
          downvotedBy: [],
          reactions: { helpful: ['student_vikram'], applause: ['student_vikram'] },
          commentsCount: 5,
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        },
        {
          authorUid: 'student_rohit',
          authorName: 'Rohit Verma',
          authorRole: 'student',
          authorBranch: 'CSE',
          authorCollege: 'KIET Group of Institutions',
          title: '❓ Doubt: Why does malloc() return void* in C? How to allocate 2D dynamic array?',
          content: 'Working on Unit 5 C-Programming pointers. If I allocate memory using malloc, why is typecasting recommended or not recommended in C99 standard? Here is the snippet I am using:',
          category: 'doubt',
          tags: ['CProgramming', 'Pointers', 'DynamicMemory', 'Unit5'],
          codeSnippet: {
            language: 'c',
            code: '#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int rows = 3, cols = 4;\n    int **arr = (int **)malloc(rows * sizeof(int *));\n    for (int i = 0; i < rows; i++) {\n        arr[i] = (int *)malloc(cols * sizeof(int));\n    }\n    printf("Dynamic 2D Array Allocated Successfully!\\n");\n    return 0;\n}'
          },
          upvotesCount: 19,
          downvotesCount: 0,
          upvotedBy: [],
          downvotedBy: [],
          reactions: { helpful: ['student_rohit'] },
          commentsCount: 4,
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
        {
          authorUid: 'student_ananya',
          authorName: 'Ananya Gupta',
          authorRole: 'student',
          authorBranch: 'ECE',
          authorCollege: 'ABES Engineering College',
          title: '😂 1st Year Engineering Exam Season be like...',
          content: 'Me preparing for Engineering Mathematics-I Differential Calculus after studying only 1 night before the internal sessional exam. Matrix rank is 3, but my brain rank is 0 💀',
          category: 'meme',
          imageUrl: 'https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=800&auto=format&fit=crop&q=60',
          tags: ['HostelLife', 'EngineeringMemes', 'Maths1', 'AKTU'],
          upvotesCount: 35,
          downvotesCount: 0,
          upvotedBy: [],
          downvotedBy: [],
          reactions: { fire: ['student_ananya'] },
          commentsCount: 8,
          createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
        }
      ];

      for (const p of initialSeed) {
        await addDoc(collection(db, 'community_posts'), p);
      }
    } catch (e) {
      console.warn('Seed community notice:', e);
    }
  };

  // Clean up all comment unsubs on unmount
  useEffect(() => {
    return () => {
      Object.values(commentUnsubsRef.current).forEach((unsub) => {
        try { unsub(); } catch {}
      });
    };
  }, []);

  // 2. Real-time subscribe to comments for a post when expanded
  const toggleComments = (postId: string) => {
    const isCurrentlyExpanded = !!expandedComments[postId];
    setExpandedComments((prev) => ({ ...prev, [postId]: !isCurrentlyExpanded }));

    if (!isCurrentlyExpanded) {
      if (commentUnsubsRef.current[postId]) {
        commentUnsubsRef.current[postId]();
      }

      const q = query(
        collection(db, `community_posts/${postId}/comments`),
        orderBy('createdAt', 'asc')
      );
      const unsub = onSnapshot(q, (snap) => {
        const commentsMap = new Map<string, CommunityComment>();
        snap.forEach((d) => {
          commentsMap.set(d.id, { id: d.id, ...d.data() } as CommunityComment);
        });
        const commentsList = Array.from(commentsMap.values());
        setPostComments((prev) => ({ ...prev, [postId]: commentsList }));

        // Update thread-specific JSON-LD structured data with loaded comments
        const targetPost = posts.find((p) => p.id === postId);
        if (targetPost) {
          try {
            const threadSchema = generateThreadJsonLd(targetPost, commentsList);
            injectStructuredDataToHead(`thread-schema-${postId}`, threadSchema);
            updateThreadMetaTags(targetPost);
          } catch (err) {
            console.warn('Thread SEO schema injection notice:', err);
          }
        }
      }, (err) => {
        console.warn('Fetch comments error:', err);
      });

      commentUnsubsRef.current[postId] = unsub;
    }
  };

  // 3. Handle Upvote / Downvote (Reddit style)
  const handleVote = async (post: CommunityPost, voteType: 'up' | 'down') => {
    if (!user) {
      if (onOpenAuth) onOpenAuth('login');
      else alert('Please sign in to upvote and participate in discussions!');
      return;
    }

    const uid = user.uid;
    const isUpvoted = (post.upvotedBy || []).includes(uid);
    const isDownvoted = (post.downvotedBy || []).includes(uid);

    const postDocRef = doc(db, 'community_posts', post.id);

    try {
      if (voteType === 'up') {
        if (isUpvoted) {
          // Cancel upvote
          await updateDoc(postDocRef, {
            upvotesCount: increment(-1),
            upvotedBy: arrayRemove(uid),
          });
        } else {
          // Add upvote, remove downvote if present
          const updates: any = {
            upvotesCount: increment(1),
            upvotedBy: arrayUnion(uid),
          };
          if (isDownvoted) {
            updates.downvotesCount = increment(-1);
            updates.downvotedBy = arrayRemove(uid);
          }
          await updateDoc(postDocRef, updates);
        }
      } else {
        if (isDownvoted) {
          // Cancel downvote
          await updateDoc(postDocRef, {
            downvotesCount: increment(-1),
            downvotedBy: arrayRemove(uid),
          });
        } else {
          const updates: any = {
            downvotesCount: increment(1),
            downvotedBy: arrayUnion(uid),
          };
          if (isUpvoted) {
            updates.upvotesCount = increment(-1);
            updates.upvotedBy = arrayRemove(uid);
          }
          await updateDoc(postDocRef, updates);
        }
      }
    } catch (e: any) {
      console.warn('Vote error:', e.message);
    }
  };

  // 4. Handle Emoji Reactions (Instagram style - Single reaction exclusivity)
  const handleReaction = async (post: CommunityPost, reactionKey: 'fire' | 'helpful' | 'applause' | 'rocket' | 'heart') => {
    if (!user) {
      if (onOpenAuth) onOpenAuth('login');
      else alert('Please sign in to react to posts!');
      return;
    }

    const uid = user.uid;
    const currentReactions: any = post.reactions || {};
    const userList: string[] = currentReactions[reactionKey] || [];
    const hasReacted = userList.includes(uid);

    const postDocRef = doc(db, 'community_posts', post.id);
    const allReactionKeys = ['fire', 'helpful', 'applause', 'rocket', 'heart'] as const;

    try {
      const updates: any = {};
      if (hasReacted) {
        // Tapping the same active reaction toggles it off
        updates[`reactions.${reactionKey}`] = arrayRemove(uid);
      } else {
        // Only ONE reaction can be active at a time
        updates[`reactions.${reactionKey}`] = arrayUnion(uid);
        for (const otherKey of allReactionKeys) {
          if (otherKey !== reactionKey && Array.isArray(currentReactions[otherKey]) && currentReactions[otherKey].includes(uid)) {
            updates[`reactions.${otherKey}`] = arrayRemove(uid);
          }
        }
      }
      await updateDoc(postDocRef, updates);
    } catch (e: any) {
      console.warn('Reaction error:', e.message);
    }
  };

  // Like single comment
  const handleLikeComment = async (postId: string, commentId: string, likedBy: string[] = []) => {
    if (!user) {
      if (onOpenAuth) onOpenAuth('login');
      else alert('Please sign in to like replies!');
      return;
    }
    const uid = user.uid;
    const isLiked = likedBy.includes(uid);
    const commentDocRef = doc(db, `community_posts/${postId}/comments`, commentId);

    try {
      if (isLiked) {
        await updateDoc(commentDocRef, {
          likesCount: increment(-1),
          likedBy: arrayRemove(uid),
        });
      } else {
        await updateDoc(commentDocRef, {
          likesCount: increment(1),
          likedBy: arrayUnion(uid),
        });
      }
    } catch (e: any) {
      console.warn('Like comment error:', e);
    }
  };

  // 5. Submit new comment / nested reply
  const handleAddComment = async (postId: string) => {
    const text = (commentInputs[postId] || '').trim();
    if (!text || !user || !profile) {
      if (!user) {
        if (onOpenAuth) onOpenAuth('login');
        else alert('Please sign in to join the conversation.');
      }
      return;
    }

    setSubmittingComment((prev) => ({ ...prev, [postId]: true }));

    try {
      const currentReply = replyingTo[postId];
      const newCommentData: Record<string, any> = {
        postId,
        authorUid: user.uid,
        authorName: profile.displayName || user.email?.split('@')[0] || 'Engineer',
        authorBranch: profile.branch || 'CSE',
        authorCollege: profile.collegeName || 'AKTU',
        authorRole: profile.role || 'student',
        text,
        createdAt: new Date().toISOString(),
        likesCount: 0,
        likedBy: [],
      };

      if (profile.photoURL) {
        newCommentData.authorPhoto = profile.photoURL;
      }

      // Social media style reply attachment
      if (currentReply) {
        newCommentData.replyToCommentId = currentReply.commentId;
        newCommentData.replyToAuthorName = currentReply.authorName;
        newCommentData.replyToAuthorUid = currentReply.authorUid;
      }

      const docRef = await addDoc(collection(db, `community_posts/${postId}/comments`), newCommentData);
      
      // Update comment count on main post
      await updateDoc(doc(db, 'community_posts', postId), {
        commentsCount: increment(1),
      });

      // Send In-App Real-time Notification
      const parentPost = posts.find((p) => p.id === postId);
      const senderName = profile.displayName || user.email?.split('@')[0] || 'A student';
      const postSnippet = parentPost ? parentPost.title.slice(0, 45) : 'Discussion';

      // 1) If replying to another student's reply
      if (currentReply && currentReply.authorUid && currentReply.authorUid !== user.uid) {
        try {
          await addDoc(collection(db, 'notifications'), {
            userId: currentReply.authorUid,
            type: 'community_reply',
            title: `${senderName} replied to your comment`,
            message: `"${text.slice(0, 95)}" in post: "${postSnippet}"`,
            postId,
            commentId: docRef.id,
            read: false,
            createdAt: new Date().toISOString(),
            actionTab: 'community',
            actionUrl: `/?post=${postId}`,
          });
        } catch (notifErr) {
          console.warn('Reply notification error:', notifErr);
        }
      } else if (parentPost && parentPost.authorUid && parentPost.authorUid !== user.uid) {
        // 2) Top level comment on the post: notify post author
        try {
          await addDoc(collection(db, 'notifications'), {
            userId: parentPost.authorUid,
            type: 'community_reply',
            title: `${senderName} commented on your post`,
            message: `"${text.slice(0, 95)}" on: "${postSnippet}"`,
            postId,
            commentId: docRef.id,
            read: false,
            createdAt: new Date().toISOString(),
            actionTab: 'community',
            actionUrl: `/?post=${postId}`,
          });
        } catch (notifErr) {
          console.warn('Comment notification error:', notifErr);
        }
      }

      // Update local state for snappy response (avoid duplicates)
      const commentWithId: CommunityComment = { id: docRef.id, ...newCommentData } as CommunityComment;
      setPostComments((prev) => {
        const existing = prev[postId] || [];
        if (existing.some((c) => c.id === docRef.id)) return prev;
        return {
          ...prev,
          [postId]: [...existing, commentWithId],
        };
      });

      // Clear input and replying indicator
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
      setReplyingTo((prev) => ({ ...prev, [postId]: null }));
      playNotificationChime('challenge');
    } catch (e: any) {
      console.warn('Comment post error:', e.message);
      alert('Failed to post comment. Please try again.');
    } finally {
      setSubmittingComment((prev) => ({ ...prev, [postId]: false }));
    }
  };

  // Open create post or trigger login modal if visitor
  const handleOpenCreatePost = () => {
    if (!user || !profile) {
      if (onOpenAuth) {
        onOpenAuth('login');
      } else {
        alert('Please sign in to create a post or ask doubts!');
      }
      return;
    }
    setIsCreateOpen(true);
  };

  // 6. Submit New Community Post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || !user || !profile) {
      if (!user) {
        if (onOpenAuth) onOpenAuth('login');
        else alert('Please sign in to publish a post.');
      }
      return;
    }

    setSubmittingPost(true);
    try {
      const postData: Record<string, any> = {
        authorUid: user.uid,
        authorName: profile.displayName || user.email?.split('@')[0] || 'Engineer',
        authorBranch: profile.branch || 'CSE',
        authorCollege: profile.collegeName || 'AKTU',
        authorRole: profile.role || 'student',
        title: newTitle.trim(),
        content: newContent.trim(),
        category: newCategory,
        tags: newTags.length > 0 ? newTags : ['AKTU'],
        upvotesCount: 1,
        downvotesCount: 0,
        upvotedBy: [user.uid],
        downvotedBy: [],
        reactions: { fire: [user.uid] },
        commentsCount: 0,
        viewsCount: 1,
        viewedBy: [user.uid],
        createdAt: new Date().toISOString(),
      };

      if (profile.photoURL) {
        postData.authorPhoto = profile.photoURL;
      }

      if (newImageUrl && newImageUrl.trim()) {
        postData.imageUrl = newImageUrl.trim();
      }

      if (hasCodeSnippet && codeContent && codeContent.trim()) {
        postData.codeSnippet = {
          language: codeLanguage,
          code: codeContent.trim()
        };
      }

      await addDoc(collection(db, 'community_posts'), postData);
      playNotificationChime('broadcast');

      // Reset form
      setNewTitle('');
      setNewContent('');
      setNewImageUrl('');
      setHasCodeSnippet(false);
      setCodeContent('');
      setNewTags(['AKTU']);
      setIsCreateOpen(false);
    } catch (e: any) {
      console.error('Create post error:', e);
      alert(e.message || 'Failed to publish post');
    } finally {
      setSubmittingPost(false);
    }
  };

  // 7. Delete Post (Author or Admin)
  const handleDeletePost = async (post: CommunityPost, forcePermanent: boolean = false) => {
    if (!user) {
      if (onOpenAuth) onOpenAuth('login');
      return;
    }
    const isAuthor = user.uid === post.authorUid || (post as any).userId === user.uid || (user.email && (post as any).authorEmail === user.email);
    const canManageAsAdmin = isAdmin || isMasterAdmin;
    if (!isAuthor && !canManageAsAdmin) {
      alert('You do not have permission to delete this post.');
      return;
    }

    // 1) If Admin is deleting another user's post (Admin moderation delete):
    if (canManageAsAdmin && !isAuthor && !forcePermanent && !post.deletedByAdmin) {
      const confirmAdminDelete = window.confirm(
        'Admin Action: Delete this community post?\n\n' +
        'Click "OK" to Mark as "Deleted by Admin" (removes from community feed, alerts author, and shows "Deleted by Admin" in author\'s My Posts).\n\n' +
        'Click "Cancel" to abort.'
      );
      if (!confirmAdminDelete) return;

      try {
        const postRef = doc(db, 'community_posts', post.id);
        const adminName = profile?.displayName || user.displayName || user.email?.split('@')[0] || 'Administrator';
        const deleteReason = 'Violation of AKTU community guidelines / Exam moderation code.';

        await updateDoc(postRef, {
          isDeleted: true,
          deletedByAdmin: true,
          deletedAt: new Date().toISOString(),
          deletedByAdminName: adminName,
          adminDeleteReason: deleteReason,
        });

        // Notify author in Firestore notifications collection
        if (post.authorUid && post.authorUid !== user.uid) {
          try {
            await addDoc(collection(db, 'notifications'), {
              userId: post.authorUid,
              type: 'system',
              title: '⚠️ Post Removed by Community Admin',
              message: `Your post "${post.title.slice(0, 50)}" was deleted by an admin (${adminName}) for moderation review.`,
              read: false,
              createdAt: new Date().toISOString(),
              actionTab: 'community',
              actionUrl: `/?post=${post.id}`,
            });
          } catch (notifErr) {
            console.warn('Admin delete notification notice:', notifErr);
          }
        }

        setPosts((prev) =>
          prev.map((p) =>
            p.id === post.id
              ? {
                  ...p,
                  isDeleted: true,
                  deletedByAdmin: true,
                  deletedAt: new Date().toISOString(),
                  deletedByAdminName: adminName,
                  adminDeleteReason: deleteReason,
                }
              : p
          )
        );
        alert('Post marked as Deleted by Admin.');
      } catch (e: any) {
        console.error('Admin delete post error:', e);
        alert('Failed to delete post as admin: ' + e.message);
      }
      return;
    }

    // 2) Author deleting their own post, or clearing a post deleted by admin, or admin hard purge:
    const confirmPrompt = post.deletedByAdmin
      ? 'Remove this deleted post permanently from your list?'
      : 'Are you sure you want to permanently delete this post? This cannot be undone.';
    
    if (!confirm(confirmPrompt)) return;

    try {
      await deleteDoc(doc(db, 'community_posts', post.id));
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    } catch (e: any) {
      console.error('Permanent delete post error:', e);
      alert('Failed to delete post: ' + e.message);
    }
  };

  // 8. Toggle Bookmark / Save
  const toggleSavePost = (postId: string) => {
    if (!user) {
      if (onOpenAuth) onOpenAuth('login');
      else alert('Please sign in to save community posts!');
      return;
    }
    setSavedPostIds((prev) => {
      const next = prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId];
      try {
        localStorage.setItem(`aktu_saved_posts_${user.uid}`, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // 9. Post Share with native Web Share API (mobile/desktop apps) & copy fallback
  const handleShare = async (post: CommunityPost) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://aktuareana.netlify.app';
    const threadUrl = `${origin}/?post=${encodeURIComponent(post.id)}#community?post=${encodeURIComponent(post.id)}`;
    const shareTitle = `${post.title} — AKTU Arena`;
    const shareSnippet = post.content ? (post.content.length > 120 ? post.content.slice(0, 117) + '...' : post.content) : '';
    const shareText = `📌 *${post.title}*\n\n${shareSnippet}\n\n🔗 Read AKTU B.Tech discussion on AKTU Arena:`;

    // Try sharing with real image file if post has an uploaded image
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        if (post.imageUrl && navigator.canShare) {
          try {
            const response = await fetch(post.imageUrl, { mode: 'cors' });
            if (response.ok) {
              const blob = await response.blob();
              const ext = blob.type.includes('png') ? 'png' : 'jpg';
              const file = new File([blob], `aktu-post-${post.id}.${ext}`, { type: blob.type || 'image/jpeg' });
              
              if (navigator.canShare({ files: [file] })) {
                await navigator.share({
                  title: shareTitle,
                  text: `${shareText}\n${threadUrl}`,
                  files: [file],
                });
                setCopiedPostId(post.id);
                setTimeout(() => setCopiedPostId(null), 2500);
                return;
              }
            }
          } catch (fileShareErr) {
            console.log('File share fallback:', fileShareErr);
          }
        }

        // Standard navigator.share
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: threadUrl,
        });
        setCopiedPostId(post.id);
        setTimeout(() => setCopiedPostId(null), 2500);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return;
        }
      }
    }

    // Fallback: Copy link
    try {
      await navigator.clipboard.writeText(threadUrl);
      setCopiedPostId(post.id);
      setTimeout(() => setCopiedPostId(null), 2500);
    } catch (e) {
      console.warn('Share copy error:', e);
    }
  };

  // 10. Admin Pin / Unpin Post
  const handleTogglePin = async (post: CommunityPost) => {
    if (!isAdmin && !isMasterAdmin) return;
    const currentPinned = !!(post.isPinned || (post as any).pinned);
    const newPinned = !currentPinned;

    try {
      const postRef = doc(db, 'community_posts', post.id);
      await updateDoc(postRef, {
        isPinned: newPinned,
        pinned: newPinned,
        pinnedAt: newPinned ? new Date().toISOString() : null,
      });

      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, isPinned: newPinned, pinned: newPinned } : p
        )
      );
    } catch (err: any) {
      console.error('Toggle pin error:', err);
      alert('Failed to update pin status: ' + err.message);
    }
  };

  // 11. Edit Post Handlers
  const handleStartEditPost = (post: CommunityPost) => {
    setEditingPost(post);
    setEditTitle(post.title || '');
    setEditContent(post.content || '');
    setEditCategory(post.category || 'discussion');
    setEditTags(post.tags || ['AKTU']);
    setEditTagInput('');
    setEditImageUrl(post.imageUrl || '');
    if (post.codeSnippet && post.codeSnippet.code) {
      setHasEditCodeSnippet(true);
      setEditCodeLanguage(post.codeSnippet.language || 'c');
      setEditCodeContent(post.codeSnippet.code);
    } else {
      setHasEditCodeSnippet(false);
      setEditCodeLanguage('c');
      setEditCodeContent('');
    }
    setIsEditOpen(true);
  };

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('Image file is too large. Please select an image under 10MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setEditImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEditedPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost || !editTitle.trim() || !editContent.trim()) {
      alert('Title and content are required.');
      return;
    }

    setSubmittingEdit(true);
    const postRef = doc(db, 'community_posts', editingPost.id);
    const isEditorAdmin = (isAdmin || isMasterAdmin) && user?.uid !== editingPost.authorUid;

    const updates: Record<string, any> = {
      title: editTitle.trim(),
      content: editContent.trim(),
      category: editCategory,
      tags: editTags.length > 0 ? editTags : ['AKTU'],
      isEdited: true,
      edited: true,
      editedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isEditorAdmin) {
      updates.editedByAdmin = true;
    }

    if (editImageUrl && editImageUrl.trim()) {
      updates.imageUrl = editImageUrl.trim();
    } else {
      updates.imageUrl = null;
    }

    if (hasEditCodeSnippet && editCodeContent.trim()) {
      updates.codeSnippet = {
        language: editCodeLanguage,
        code: editCodeContent.trim(),
      };
    } else {
      updates.codeSnippet = null;
    }

    try {
      await updateDoc(postRef, updates);

      setPosts((prev) =>
        prev.map((p) =>
          p.id === editingPost.id
            ? {
                ...p,
                ...updates,
                imageUrl: updates.imageUrl || undefined,
                codeSnippet: updates.codeSnippet || undefined,
              }
            : p
        )
      );

      setIsEditOpen(false);
      setEditingPost(null);
    } catch (err: any) {
      console.error('Failed to update post:', err);
      alert('Failed to save changes: ' + err.message);
    } finally {
      setSubmittingEdit(false);
    }
  };

  // 12. Copy Code Snippet
  const handleCopyCode = (postId: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(postId);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // User posts computation for "My Posts"
  const myPosts = user 
    ? posts.filter((p) => p.authorUid === user.uid || (p as any).userId === user.uid || (user.email && (p as any).authorEmail === user.email)) 
    : [];
  const myPostsCount = myPosts.length;
  const totalMyViews = myPosts.reduce((acc, p) => acc + (p.viewsCount || p.viewedBy?.length || 1), 0);

  // Filter & Search logic
  const filteredPosts = posts.filter((p) => {
    const isUserAuthor = !!(user && (
      p.authorUid === user.uid || 
      (p as any).userId === user.uid || 
      (user.email && (p as any).authorEmail === user.email)
    ));

    // In general feed, hide soft-deleted / deleted by admin posts unless user is admin or author
    if (p.isDeleted || p.deletedByAdmin) {
      if (!isAdmin && !isMasterAdmin && !isUserAuthor) {
        return false;
      }
    }

    if (activeFilter === 'doubt' && p.category !== 'doubt') return false;
    if (activeFilter === 'notes' && p.category !== 'notes') return false;
    if (activeFilter === 'meme' && p.category !== 'meme') return false;
    if (activeFilter === 'showcase' && p.category !== 'showcase') return false;

    if (selectedTag && !(p.tags || []).some((t) => t.toLowerCase() === selectedTag.toLowerCase())) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = (p.title || '').toLowerCase().includes(q);
      const matchContent = (p.content || '').toLowerCase().includes(q);
      const matchAuthor = (p.authorName || '').toLowerCase().includes(q);
      const matchTag = (p.tags || []).some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchAuthor && !matchTag) return false;
    }

    return true;
  }).sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    if (activeFilter === 'trending') {
      const scoreA = (a.upvotesCount || 0) * 2 + (a.commentsCount || 0) * 3 - (a.downvotesCount || 0);
      const scoreB = (b.upvotesCount || 0) * 2 + (b.commentsCount || 0) * 3 - (b.downvotesCount || 0);
      return scoreB - scoreA;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const allTags = Array.from(
    new Set(posts.flatMap((p) => p.tags || []).filter(Boolean))
  ).slice(0, 10);

  const getCategoryBadge = (cat: CommunityPost['category']) => {
    switch (cat) {
      case 'doubt':
        return { label: 'Exam Doubt', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30', icon: HelpCircle };
      case 'notes':
        return { label: 'Notes & PYQ', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: BookOpen };
      case 'meme':
        return { label: 'Campus Meme', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: Coffee };
      case 'showcase':
        return { label: 'Project / Code', color: 'bg-violet-500/10 text-violet-400 border-violet-500/30', icon: Code };
      default:
        return { label: 'Discussion', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30', icon: MessageSquare };
    }
  };

  const handleRefreshFeed = async () => {
    try {
      const postsQuery = query(
        collection(db, 'community_posts'),
        orderBy('createdAt', 'desc'),
        limit(60)
      );
      const snap = await getDocs(postsQuery);
      const postsMap = new Map<string, CommunityPost>();
      snap.forEach((docSnap) => {
        postsMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() } as CommunityPost);
      });
      const fetched = Array.from(postsMap.values());
      if (fetched.length > 0) {
        setPosts(fetched);
      }
    } catch (err) {
      console.warn('Manual pull refresh error:', err);
    }
    await new Promise((resolve) => setTimeout(resolve, 600));
  };

  return (
    <PullToRefresh onRefresh={handleRefreshFeed} className="w-full">
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Clean Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0A0E17] p-3.5 sm:p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 font-['Outfit']">
              Community Discussions
            </h2>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              AKTU B.Tech Doubts, Solved Notes, PYQs & Coding Help
            </p>
          </div>
        </div>

        {/* Action Button: Create Post */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleOpenCreatePost}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-slate-950 flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Post / Ask Doubt</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Navigation Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => { setActiveFilter('trending'); setSelectedTag(null); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeFilter === 'trending' && !selectedTag
                ? 'bg-cyan-600 text-slate-950 shadow-md'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Trending</span>
          </button>

          <button
            onClick={() => { setActiveFilter('latest'); setSelectedTag(null); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeFilter === 'latest' && !selectedTag
                ? 'bg-cyan-600 text-slate-950 shadow-md'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Latest</span>
          </button>

          <button
            onClick={() => { setActiveFilter('doubt'); setSelectedTag(null); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeFilter === 'doubt' && !selectedTag
                ? 'bg-rose-500 text-slate-950 shadow-md'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Doubts & Solutions</span>
          </button>

          <button
            onClick={() => { setActiveFilter('notes'); setSelectedTag(null); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeFilter === 'notes' && !selectedTag
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>Notes & PYQs</span>
          </button>

          <button
            onClick={() => { setActiveFilter('meme'); setSelectedTag(null); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeFilter === 'meme' && !selectedTag
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Coffee className="w-3.5 h-3.5 text-amber-400" />
            <span>Campus Memes</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics, questions, #tags..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Tag Cloud Selector */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
            <Tag className="w-3 h-3 text-cyan-400" /> Popular Tags:
          </span>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${
                selectedTag === tag
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              #{tag}
            </button>
          ))}
          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="text-[10px] text-rose-400 hover:underline ml-1"
            >
              Clear Filter
            </button>
          )}
        </div>
      )}

      {/* Main Posts Feed Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-mono">Syncing live engineering community feed...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
            <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-200">
              No community posts found
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Be the first scholar to ask an exam doubt, share notes, or post a meme!
            </p>
            <button
              onClick={handleOpenCreatePost}
              className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-slate-950 transition-colors cursor-pointer"
            >
              Start First Discussion
            </button>
          </div>
        ) : (
          filteredPosts.map((post, postIdx) => {
            const badge = getCategoryBadge(post.category);
            const BadgeIcon = badge.icon;
            const isUpvoted = user && (post.upvotedBy || []).includes(user.uid);
            const isDownvoted = user && (post.downvotedBy || []).includes(user.uid);
            const score = (post.upvotesCount || 0) - (post.downvotesCount || 0);
            const isSaved = savedPostIds.includes(post.id);
            const isCommentsOpen = !!expandedComments[post.id];
            const commentsList = postComments[post.id] || [];
            const isAuthor = !!(user && (
              user.uid === post.authorUid ||
              (post as any).userId === user.uid ||
              (user.email && (post as any).authorEmail === user.email)
            ));
            const canDelete = isAdmin || isMasterAdmin || isAuthor;
            const canEdit = !post.deletedByAdmin && (isAuthor || isAdmin || isMasterAdmin);
            const isPinned = !!(post.isPinned || (post as any).pinned);
            const isEdited = !!(post.isEdited || (post as any).edited);
            const isEditedByAdmin = !!post.editedByAdmin;
            const isDeletedByAdmin = !!(post.deletedByAdmin || (post.isDeleted && post.deletedByAdminName));
            const isTargeted = targetedPostId === post.id;
            const viewsCountDisplay = post.viewsCount || post.viewedBy?.length || 1;

            return (
              <div 
                key={post.id ? `post-${post.id}` : `post-idx-${postIdx}`}
                id={`community-${post.id}`}
                data-post-id={post.id}
                className={`rounded-2xl bg-[#0A0E17] border transition-all duration-300 ${
                  isTargeted
                    ? 'border-cyan-400 ring-2 ring-cyan-400/80 shadow-[0_0_30px_rgba(6,182,212,0.4)]'
                    : isPinned 
                      ? 'border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.1)]' 
                      : isDeletedByAdmin
                        ? 'border-rose-500/40 bg-rose-950/10'
                        : 'border-slate-800 hover:border-slate-700/80'
                }`}
              >
                {/* Pinned Tag Banner */}
                {isPinned && !isDeletedByAdmin && (
                  <div className="px-4 py-1.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-[11px] font-bold text-amber-300">
                    <div className="flex items-center gap-1.5">
                      <Pin className="w-3.5 h-3.5 text-amber-400 rotate-45 fill-amber-400" />
                      <span>PINNED IN {post.category?.toUpperCase() || 'COMMUNITY'}</span>
                    </div>
                    <span className="text-[10px] text-amber-400/80 font-mono">Category Highlight</span>
                  </div>
                )}

                {/* Deleted By Admin Warning Banner */}
                {isDeletedByAdmin && (
                  <div className="px-4 py-2.5 bg-rose-950/40 border-b border-rose-500/30 flex items-center justify-between gap-3 text-xs text-rose-300">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <div>
                        <span className="font-bold text-rose-200 uppercase tracking-wide mr-1.5">Deleted by Admin</span>
                        <span className="text-rose-300/80 text-[11px]">
                          {post.adminDeleteReason || 'Removed by platform administrator for moderation review.'}
                        </span>
                      </div>
                    </div>
                    {canDelete && (
                      <button
                        onClick={() => handleDeletePost(post, true)}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 text-[11px] font-bold shrink-0 transition-colors cursor-pointer"
                        title="Permanently remove post from your list"
                      >
                        Clear Post
                      </button>
                    )}
                  </div>
                )}

                <div className="p-4 sm:p-5 space-y-3.5">
                  {/* Post Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-300 font-bold text-xs shrink-0 overflow-hidden">
                        {post.authorPhoto ? (
                          <img src={post.authorPhoto} alt={post.authorName} className="w-full h-full object-cover" />
                        ) : (
                          <span>{post.authorName?.[0] || 'U'}</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-100 truncate">
                            {post.authorName}
                          </span>
                          {post.authorRole === 'admin' && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold">
                              ADMIN
                            </span>
                          )}
                          {post.authorRole === 'subadmin' && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono font-bold">
                              SUB-ADMIN
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500 font-mono">
                            • {post.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recently'}
                          </span>
                          {isEditedByAdmin ? (
                            <span className="text-[10px] font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.2 rounded">
                              edited by admin
                            </span>
                          ) : isEdited ? (
                            <span className="text-[10px] text-slate-400 italic">
                              (edited)
                            </span>
                          ) : null}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                          <span>{post.authorBranch || 'CSE'}</span>
                          <span>•</span>
                          <span className="truncate">{post.authorCollege || 'AKTU'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Unique Views Counter Badge */}
                      <div 
                        className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300"
                        title={`${viewsCountDisplay} unique scholars viewed this post`}
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="font-mono font-bold text-cyan-300">{viewsCountDisplay}</span>
                        <span className="text-slate-500 text-[10px] hidden sm:inline">views</span>
                      </div>

                      {/* Category Pill */}
                      <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border flex items-center gap-1 ${badge.color}`}>
                        <BadgeIcon className="w-3 h-3" />
                        <span>{badge.label}</span>
                      </span>

                      {/* Admin Pin / Highlight Button */}
                      {(isAdmin || isMasterAdmin) && !isDeletedByAdmin && (
                        <button
                          onClick={() => handleTogglePin(post)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            isPinned
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                              : 'text-slate-500 hover:text-amber-400 hover:bg-slate-900 border-slate-800'
                          }`}
                          title={isPinned ? `Unpin post from ${post.category}` : `Pin & Highlight post in ${post.category}`}
                        >
                          <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-400 rotate-45' : ''}`} />
                        </button>
                      )}

                      {/* Edit Option for Author or Admin */}
                      {canEdit && (
                        <button
                          onClick={() => handleStartEditPost(post)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
                          title={isAdmin && !isAuthor ? 'Edit Post (as Admin)' : 'Edit Post'}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Delete Option if authorized (Author or Admin) */}
                      {canDelete && (
                        <button
                          onClick={() => handleDeletePost(post)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
                          title={
                            isAuthor 
                              ? "Delete My Post" 
                              : isAdmin && !isAuthor 
                                ? "Delete Post (as Admin)" 
                                : "Delete Post"
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Post Title & Body */}
                  <div className="space-y-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-100 font-['Outfit'] leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>
                  </div>

                  {/* Code Snippet Box if available */}
                  {post.codeSnippet && (
                    <div className="rounded-xl bg-[#05070B] border border-slate-800 overflow-hidden">
                      <div className="px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span className="text-cyan-400 font-bold uppercase">{post.codeSnippet.language} SNIPPET</span>
                        <button
                          onClick={() => handleCopyCode(post.id, post.codeSnippet!.code)}
                          className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                        >
                          {copiedCodeId === post.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-3 text-xs text-cyan-300/90 font-mono overflow-x-auto leading-relaxed max-h-56">
                        <code>{post.codeSnippet.code}</code>
                      </pre>
                    </div>
                  )}

                  {/* Image Attachment if available */}
                  {post.imageUrl && (
                    <div 
                      onClick={() => setPreviewImage(post.imageUrl || null)}
                      className="rounded-xl overflow-hidden border border-slate-800 max-h-96 bg-slate-950 flex items-center justify-center cursor-pointer group relative"
                    >
                      <img 
                        src={post.imageUrl} 
                        alt="Post Attachment" 
                        className="w-full h-auto max-h-96 object-contain group-hover:scale-[1.01] transition-transform duration-200"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                      <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] text-cyan-300 font-mono opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" /> Click to Zoom
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {post.tags.map((t, idx) => (
                        <span 
                          key={idx} 
                          onClick={() => setSelectedTag(t)}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 cursor-pointer transition-colors"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Interactive Footer (Reddit Upvotes + Insta Reactions + Comments + Share) */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
                    
                    {/* Left: Upvote / Downvote & Reactions */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      
                      {/* Reddit Style Vote Pill */}
                      <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-0.5">
                        <button
                          onClick={() => handleVote(post, 'up')}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isUpvoted ? 'text-cyan-400 bg-cyan-950/60' : 'text-slate-400 hover:text-cyan-300'
                          }`}
                          title="Upvote"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        
                        <span className={`px-2 text-xs font-mono font-bold ${
                          score > 0 ? 'text-cyan-300' : score < 0 ? 'text-rose-400' : 'text-slate-400'
                        }`}>
                          {score}
                        </span>

                        <button
                          onClick={() => handleVote(post, 'down')}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isDownvoted ? 'text-rose-400 bg-rose-950/60' : 'text-slate-400 hover:text-rose-300'
                          }`}
                          title="Downvote"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Instagram Style Reactions */}
                      <button
                        onClick={() => handleReaction(post, 'heart')}
                        className={`px-2 py-1 rounded-xl text-xs font-medium border flex items-center gap-1 transition-all cursor-pointer ${
                          user && ((post.reactions as any)?.heart || []).includes(user.uid)
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                        title="Love / Heart"
                      >
                        <Heart className={`w-3.5 h-3.5 ${user && ((post.reactions as any)?.heart || []).includes(user.uid) ? 'fill-rose-400 text-rose-400' : 'text-slate-400'}`} />
                        <span>{((post.reactions as any)?.heart || []).length || 0}</span>
                      </button>

                      <button
                        onClick={() => handleReaction(post, 'fire')}
                        className={`px-2 py-1 rounded-xl text-xs font-medium border flex items-center gap-1 transition-all cursor-pointer ${
                          user && (post.reactions?.fire || []).includes(user.uid)
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                        title="Lit / Fire"
                      >
                        <span>🔥</span>
                        <span>{(post.reactions?.fire || []).length || 0}</span>
                      </button>

                      <button
                        onClick={() => handleReaction(post, 'helpful')}
                        className={`px-2 py-1 rounded-xl text-xs font-medium border flex items-center gap-1 transition-all cursor-pointer ${
                          user && (post.reactions?.helpful || []).includes(user.uid)
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                        title="Helpful Solution"
                      >
                        <span>💡</span>
                        <span>{(post.reactions?.helpful || []).length || 0}</span>
                      </button>

                      <button
                        onClick={() => handleReaction(post, 'rocket')}
                        className={`px-2 py-1 rounded-xl text-xs font-medium border flex items-center gap-1 transition-all cursor-pointer ${
                          user && (post.reactions?.rocket || []).includes(user.uid)
                            ? 'bg-violet-500/20 text-violet-300 border-violet-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                        title="Rocket / Super"
                      >
                        <span>🚀</span>
                        <span>{(post.reactions?.rocket || []).length || 0}</span>
                      </button>
                    </div>

                    {/* Right: Comments toggle & Bookmarking */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleComments(post.id)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isCommentsOpen
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{post.commentsCount || 0} Replies</span>
                      </button>

                      <button
                        onClick={() => toggleSavePost(post.id)}
                        className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                          isSaved
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                        title={isSaved ? 'Remove Bookmark' : 'Save Post'}
                      >
                        {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleShare(post)}
                        className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors cursor-pointer"
                        title="Share Post Link"
                      >
                        {copiedPostId === post.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Comments & Replies Section */}
                  {isCommentsOpen && (
                    <div className="pt-3 border-t border-slate-800/80 space-y-3">
                      {/* Comments List */}
                      {commentsList.length === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-500">
                          No replies yet. Be the first to help out or comment!
                        </div>
                      ) : (
                        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                          {commentsList.map((comm, commIdx) => {
                            const isCommentLiked = user && (comm.likedBy || []).includes(user.uid);
                            const isNestedReply = !!comm.replyToCommentId;

                            return (
                              <div 
                                key={comm.id ? `comm-${comm.id}` : `comm-idx-${commIdx}`} 
                                className={`p-2.5 rounded-xl border space-y-1.5 transition-all ${
                                  isNestedReply
                                    ? 'ml-4 sm:ml-7 bg-slate-950/90 border-cyan-500/20 border-l-2 border-l-cyan-400 pl-3'
                                    : 'bg-slate-950/80 border-slate-800/80'
                                }`}
                              >
                                <div className="flex items-center justify-between text-[11px] flex-wrap gap-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {isNestedReply && (
                                      <CornerDownRight className="w-3 h-3 text-cyan-400 shrink-0" />
                                    )}
                                    <span className="font-bold text-slate-200">{comm.authorName}</span>
                                    {comm.replyToAuthorName && (
                                      <span className="text-cyan-400 font-medium text-[10px] bg-cyan-950/50 px-1.5 py-0.2 rounded border border-cyan-500/30">
                                        @{comm.replyToAuthorName}
                                      </span>
                                    )}
                                    <span className="text-slate-500 font-mono">• {comm.authorBranch}</span>
                                    {comm.authorRole === 'admin' && (
                                      <span className="text-[9px] px-1 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded font-mono font-bold">
                                        ADMIN
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-slate-500 font-mono">
                                      {new Date(comm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>

                                    {/* Like Comment */}
                                    <button
                                      onClick={() => handleLikeComment(post.id, comm.id, comm.likedBy)}
                                      className={`flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                                        isCommentLiked 
                                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                                      }`}
                                      title="Like reply"
                                    >
                                      <Heart className={`w-3 h-3 ${isCommentLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
                                      <span>{comm.likesCount || 0}</span>
                                    </button>

                                    {/* Social media style Reply button */}
                                    <button
                                      onClick={() => {
                                        if (!user) {
                                          if (onOpenAuth) onOpenAuth('login');
                                          return;
                                        }
                                        setReplyingTo((prev) => ({
                                          ...prev,
                                          [post.id]: {
                                            commentId: comm.id,
                                            authorName: comm.authorName,
                                            authorUid: comm.authorUid,
                                          },
                                        }));
                                        setCommentInputs((prev) => ({
                                          ...prev,
                                          [post.id]: prev[post.id] ? prev[post.id] : `@${comm.authorName} `,
                                        }));
                                      }}
                                      className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-slate-900 text-slate-400 border border-slate-800 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors cursor-pointer"
                                      title={`Reply to @${comm.authorName}`}
                                    >
                                      <Reply className="w-3 h-3 rotate-180" />
                                      <span>Reply</span>
                                    </button>
                                  </div>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{comm.text}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Social media style active reply tag indicator */}
                      {replyingTo[post.id] && (
                        <div className="flex items-center justify-between px-3 py-1.5 bg-cyan-950/50 border border-cyan-500/30 rounded-xl text-xs text-cyan-300 animate-fadeIn">
                          <div className="flex items-center gap-1.5">
                            <Reply className="w-3.5 h-3.5 text-cyan-400 rotate-180" />
                            <span>
                              Replying to <span className="font-bold text-cyan-200">@{replyingTo[post.id]!.authorName}</span>
                            </span>
                          </div>
                          <button
                            onClick={() => setReplyingTo((prev) => ({ ...prev, [post.id]: null }))}
                            className="text-slate-400 hover:text-slate-200 p-0.5 cursor-pointer rounded hover:bg-slate-800"
                            title="Cancel reply tag"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Add Comment Input Form */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleAddComment(post.id);
                            }
                          }}
                          placeholder={
                            replyingTo[post.id]
                              ? `Reply to @${replyingTo[post.id]!.authorName}...`
                              : user
                                ? "Write a helpful solution or reply..."
                                : "Sign in to reply..."
                          }
                          disabled={!user || submittingComment[post.id]}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          disabled={!user || submittingComment[post.id] || !(commentInputs[post.id] || '').trim()}
                          className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50 shrink-0"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Reply</span>
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Post Modal */}
      {isCreateOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
          onClick={() => setIsCreateOpen(false)}
        >
          <div 
            className="w-full max-w-xl bg-[#0D111A] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#0A0E17]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 font-['Outfit']">Create Community Post</h3>
                  <p className="text-xs text-slate-400">Share doubts, notes, formulas, or memes with fellow engineers.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleCreatePost} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
              {/* Category selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Post Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'doubt', label: 'Exam Doubt', icon: HelpCircle },
                    { id: 'notes', label: 'Notes & PYQs', icon: BookOpen },
                    { id: 'meme', label: 'Campus Meme', icon: Coffee },
                    { id: 'showcase', label: 'Code & Projects', icon: Code },
                  ].map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setNewCategory(cat.id as any)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                          newCategory === cat.id
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-sm'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Post Headline / Topic Question <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. How to evaluate double integrals in Engineering Maths-I?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description / Details <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Explain your doubt, paste the exam problem, or share your tips..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              {/* Code Snippet Option */}
              <div className="space-y-2 pt-1 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasCodeSnippet}
                      onChange={(e) => setHasCodeSnippet(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                    />
                    <span>Attach Code Snippet (C, Python, Java, DSA)</span>
                  </label>
                  {hasCodeSnippet && (
                    <select
                      value={codeLanguage}
                      onChange={(e) => setCodeLanguage(e.target.value)}
                      className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-cyan-300"
                    >
                      <option value="c">C Language</option>
                      <option value="cpp">C++</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="sql">SQL</option>
                    </select>
                  )}
                </div>

                {hasCodeSnippet && (
                  <textarea
                    rows={4}
                    value={codeContent}
                    onChange={(e) => setCodeContent(e.target.value)}
                    placeholder="// Paste your code here..."
                    className="w-full p-3 rounded-xl bg-[#05070B] border border-slate-800 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 resize-none"
                  />
                )}
              </div>

              {/* Direct Image Upload & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-800/80">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Attach Diagram, Meme or Notes Photo
                  </label>
                  <input
                    type="file"
                    ref={postFileInputRef}
                    accept="image/*"
                    onChange={handlePostImageUpload}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => postFileInputRef.current?.click()}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-all cursor-pointer w-full justify-center"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{newImageUrl ? 'Change Attached Image' : 'Select Image File'}</span>
                    </button>
                    {newImageUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setNewImageUrl('');
                          if (postFileInputRef.current) postFileInputRef.current.value = '';
                        }}
                        className="p-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-400 transition-colors cursor-pointer shrink-0"
                        title="Remove Image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Add Tags (Press Enter or Comma)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          const val = newTagInput.trim().replace(/^#/, '');
                          if (val && !newTags.includes(val)) {
                            setNewTags([...newTags, val]);
                            setNewTagInput('');
                          }
                        }
                      }}
                      placeholder="e.g. Maths1, Unit2"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Attached Image Preview */}
              {newImageUrl && (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 relative group">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" /> Image Ready for Upload:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setNewImageUrl('');
                        if (postFileInputRef.current) postFileInputRef.current.value = '';
                      }}
                      className="text-[10px] text-rose-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" /> Remove
                    </button>
                  </div>
                  <img
                    src={newImageUrl}
                    alt="Upload Preview"
                    className="max-h-36 w-auto rounded-lg object-contain border border-slate-800 bg-black/40"
                  />
                </div>
              )}

              {/* Tags Display */}
              {newTags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {newTags.map((t) => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1 font-mono">
                      #{t}
                      <button
                        type="button"
                        onClick={() => setNewTags(newTags.filter((tag) => tag !== t))}
                        className="hover:text-rose-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPost || !newTitle.trim() || !newContent.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-slate-950 transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingPost ? 'Publishing...' : 'Publish to Feed'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Community Post Modal */}
      {isEditOpen && editingPost && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
          onClick={() => setIsEditOpen(false)}
        >
          <div 
            className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#0B0F19] border border-cyan-500/30 shadow-2xl p-5 sm:p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 font-['Outfit']">
                    {(isAdmin || isMasterAdmin) && user?.uid !== editingPost.authorUid
                      ? 'Edit Post (Admin Override)'
                      : 'Edit Community Post'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Update thread content, attached solutions, or category tags
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Admin vs Author indicator */}
            {(isAdmin || isMasterAdmin) && user?.uid !== editingPost.authorUid ? (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 font-medium">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Admin Mode: You are modifying this post. It will be marked as <strong>"edited by admin"</strong> on the forum.</span>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-2 font-medium">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Author Mode: Modifying your post. It will be marked with an <strong>(edited)</strong> timestamp.</span>
              </div>
            )}

            <form onSubmit={handleSaveEditedPost} className="space-y-3.5">
              {/* Category Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="doubt">❓ Exam Doubt (BAS103/BAS101/BCS101)</option>
                  <option value="notes">📚 Handwritten Notes & PYQ Solutions</option>
                  <option value="discussion">💬 Technical Engineering Discussion</option>
                  <option value="showcase">💻 Project / C-Code Showcase</option>
                  <option value="meme">☕ Campus Humor / AKTU B.Tech Meme</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Post Title
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Enter descriptive title"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Post Description & Details
                </label>
                <textarea
                  required
                  rows={4}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Elaborate on the question, solution, notes, or tips..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-cyan-500 resize-y"
                />
              </div>

              {/* Code Snippet Toggle */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setHasEditCodeSnippet(!hasEditCodeSnippet)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer font-semibold"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>{hasEditCodeSnippet ? 'Remove Code Snippet' : '+ Attach Code Snippet (C / Python / JS)'}</span>
                </button>

                {hasEditCodeSnippet && (
                  <div className="mt-2 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">Language:</span>
                      <select
                        value={editCodeLanguage}
                        onChange={(e) => setEditCodeLanguage(e.target.value)}
                        className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-cyan-300 font-mono focus:outline-none"
                      >
                        <option value="c">C Language (BCS101)</option>
                        <option value="cpp">C++</option>
                        <option value="python">Python / AI (BAI101)</option>
                        <option value="javascript">JavaScript / TypeScript</option>
                      </select>
                    </div>
                    <textarea
                      rows={4}
                      value={editCodeContent}
                      onChange={(e) => setEditCodeContent(e.target.value)}
                      placeholder="// Paste code snippet here..."
                      className="w-full p-2.5 rounded-lg bg-[#05070B] border border-slate-800 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                )}
              </div>

              {/* Image Attachment */}
              <div className="pt-1 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-cyan-400" /> Attached Image / Diagram
                  </label>
                </div>

                <input
                  type="file"
                  ref={editFileInputRef}
                  onChange={handleEditImageUpload}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-all cursor-pointer w-full justify-center"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{editImageUrl ? 'Change Attached Image' : 'Attach / Upload Image File'}</span>
                  </button>
                  {editImageUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditImageUrl('');
                        if (editFileInputRef.current) editFileInputRef.current.value = '';
                      }}
                      className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-400 transition-colors cursor-pointer shrink-0"
                      title="Remove Image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {editImageUrl && (
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <img
                      src={editImageUrl}
                      alt="Attachment Preview"
                      className="max-h-24 w-auto rounded-lg object-contain border border-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setEditImageUrl('')}
                      className="text-xs text-rose-400 hover:underline px-2 cursor-pointer"
                    >
                      Delete Attachment
                    </button>
                  </div>
                )}
              </div>

              {/* Tags Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tags (Press Enter or Comma to add)
                </label>
                <input
                  type="text"
                  value={editTagInput}
                  onChange={(e) => setEditTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      const val = editTagInput.trim().replace(/^#/, '');
                      if (val && !editTags.includes(val)) {
                        setEditTags([...editTags, val]);
                        setEditTagInput('');
                      }
                    }
                  }}
                  placeholder="e.g. BAS103, Matrices, PYQ2025"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />

                {editTags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap mt-2">
                    {editTags.map((t) => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1 font-mono">
                        #{t}
                        <button
                          type="button"
                          onClick={() => setEditTags(editTags.filter((tag) => tag !== t))}
                          className="hover:text-rose-400"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditOpen(false);
                    setEditingPost(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit || !editTitle.trim() || !editContent.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{submittingEdit ? 'Saving Changes...' : 'Save & Update Post'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Resolution Image Lightbox Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="relative max-w-5xl max-h-[92vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors"
              title="Close Image Preview"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={previewImage} 
              alt="Enlarged Diagram / Attachment" 
              className="max-h-[85vh] w-auto rounded-2xl object-contain border border-slate-700 shadow-2xl bg-black/50" 
            />
          </div>
        </div>
      )}

      </div>
    </PullToRefresh>
  );
};
