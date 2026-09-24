import { CommunityPost, CommunityComment } from '../types';

/**
 * Generates Schema.org compliant structured data (JSON-LD) for an individual DiscussionForumPosting.
 * Supports Google's Discussion Forum and Q&A rich snippet standards.
 */
export function generateThreadJsonLd(
  post: CommunityPost,
  comments: CommunityComment[] = [],
  origin: string = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-dktyuerqdvefeocczz24ys-397457279887.asia-northeast1.run.app'
) {
  const threadUrl = `${origin}/#community?post=${encodeURIComponent(post.id)}`;
  const isQuestion = post.category === 'doubt' || post.title.toLowerCase().includes('doubt') || post.title.includes('?');

  const discussionPosting: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': isQuestion ? 'DiscussionForumPosting' : 'DiscussionForumPosting',
    '@id': threadUrl,
    'mainEntityOfPage': threadUrl,
    'headline': post.title,
    'name': post.title,
    'articleBody': post.content,
    'text': post.content,
    'datePublished': post.createdAt,
    'dateModified': post.createdAt,
    'discussionUrl': threadUrl,
    'articleSection': post.category ? post.category.toUpperCase() : 'B.Tech Engineering',
    'keywords': (post.tags || []).join(', '),
    'author': {
      '@type': 'Person',
      'name': post.authorName,
      'jobTitle': `${post.authorBranch || 'B.Tech'} Student`,
      'affiliation': {
        '@type': 'EducationalOrganization',
        'name': post.authorCollege || 'AKTU Affiliated Engineering College',
      },
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'AKTU Arena',
      'url': origin,
      'logo': {
        '@type': 'ImageObject',
        'url': `${origin}/pwa-512x512.png`,
      },
    },
    'interactionStatistic': [
      {
        '@type': 'InteractionCounter',
        'interactionType': 'https://schema.org/LikeAction',
        'userInteractionCount': Math.max(0, (post.upvotesCount || 0) - (post.downvotesCount || 0)),
      },
      {
        '@type': 'InteractionCounter',
        'interactionType': 'https://schema.org/CommentAction',
        'userInteractionCount': post.commentsCount || comments.length || 0,
      },
    ],
  };

  if (post.imageUrl) {
    discussionPosting.image = [post.imageUrl];
  }

  if (comments && comments.length > 0) {
    discussionPosting.comment = comments.map((comm) => ({
      '@type': 'Comment',
      'text': comm.text,
      'dateCreated': comm.createdAt,
      'author': {
        '@type': 'Person',
        'name': comm.authorName,
        'jobTitle': `${comm.authorBranch || 'B.Tech'} Student`,
      },
      'upvoteCount': comm.likesCount || 0,
    }));
  }

  return discussionPosting;
}

/**
 * Generates structured data for the whole community discussion feed (ItemPage / CollectionPage).
 */
export function generateFeedJsonLd(
  posts: CommunityPost[],
  origin: string = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-dktyuerqdvefeocczz24ys-397457279887.asia-northeast1.run.app'
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${origin}/#community`,
    'name': 'AKTU Engineering Community — Exam Doubts, Notes & PYQs',
    'description': 'Real-time discussion forum for AKTU B.Tech 1st year students across 750+ affiliated colleges.',
    'url': `${origin}/#community`,
    'mainEntity': {
      '@type': 'ItemList',
      'numberOfItems': posts.length,
      'itemListElement': posts.slice(0, 15).map((post, idx) => ({
        '@type': 'ListItem',
        'position': idx + 1,
        'item': generateThreadJsonLd(post, [], origin),
      })),
    },
  };
}

/**
 * Injects or updates a JSON-LD script tag in the document <head>.
 */
export function injectStructuredDataToHead(scriptId: string, schemaObj: object): void {
  if (typeof document === 'undefined') return;

  try {
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(schemaObj, null, 2);
  } catch (err) {
    console.warn('Failed to inject JSON-LD structured data:', err);
  }
}

/**
 * Dynamically updates document metadata for an individual post or community thread.
 */
export function updateThreadMetaTags(post: CommunityPost, origin: string = typeof window !== 'undefined' ? window.location.origin : ''): () => void {
  if (typeof document === 'undefined') return () => {};

  const prevTitle = document.title;
  const metaDesc = document.querySelector('meta[name="description"]');
  const prevDesc = metaDesc?.getAttribute('content') || '';

  const ogTitle = document.querySelector('meta[property="og:title"]');
  const prevOgTitle = ogTitle?.getAttribute('content') || '';

  const ogDesc = document.querySelector('meta[property="og:description"]');
  const prevOgDesc = ogDesc?.getAttribute('content') || '';

  const snippet = post.content.length > 140 ? `${post.content.slice(0, 137)}...` : post.content;
  const newTitle = `${post.title} — AKTU Community | AKTU Arena`;

  document.title = newTitle;
  if (metaDesc) metaDesc.setAttribute('content', `${post.authorName} (${post.authorCollege || 'AKTU'}): ${snippet}`);
  if (ogTitle) ogTitle.setAttribute('content', newTitle);
  if (ogDesc) ogDesc.setAttribute('content', snippet);

  return () => {
    document.title = prevTitle;
    if (metaDesc && prevDesc) metaDesc.setAttribute('content', prevDesc);
    if (ogTitle && prevOgTitle) ogTitle.setAttribute('content', prevOgTitle);
    if (ogDesc && prevOgDesc) ogDesc.setAttribute('content', prevOgDesc);
  };
}
