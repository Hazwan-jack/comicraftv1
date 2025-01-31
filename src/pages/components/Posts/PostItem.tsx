import { Post } from '@/atoms/postsAtom';
import { Alert, AlertIcon, Flex, Icon, Image, Skeleton, Spinner, Stack, Text } from '@chakra-ui/react';
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import { BsChat, BsDot } from 'react-icons/bs';
import {
  IoArrowDownCircleOutline,
  IoArrowDownCircleSharp,
  IoArrowRedoOutline,
  IoArrowUpCircleOutline,
  IoArrowUpCircleSharp,
  IoBookmarkOutline,
} from 'react-icons/io5';
import { SiInoreader } from 'react-icons/si'; // Importing SiInoreader
import Link from 'next/link'; // Import Link from Next.js

type PostItemProps = {
  post: Post;
  userIsCreator: boolean;
  userVoteValue?: number;
  onVote: (event: React.MouseEvent<SVGElement, MouseEvent>, post: Post, vote: number, communityId: string) => void;
  onDeletePost: (post: Post) => Promise<boolean>;
  onSelectPost?: (post: Post) => void;
  homePage?: boolean;
};

const PostItem: React.FC<PostItemProps> = ({
  post,
  userIsCreator,
  userVoteValue,
  onVote,
  onDeletePost,
  onSelectPost,
  homePage,
}) => {
  const [loadingImage, setLoadingImage] = useState(true);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const [shareableLink, setShareableLink] = useState('');

  const generateShareableLink = () => {
    const currentUrl = window.location.origin;
    const postUrl = `${currentUrl}/r/${post.communityId}/comments/${post.id}`;
    setShareableLink(postUrl);
  };

  const handleDelete = async (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    setLoadingDelete(true);
    try {
      const success = await onDeletePost(post);
      if (!success) {
        throw new Error('Failed to delete post');
      }
      if (!onSelectPost) {
        router.push(`/r/${post.communityId}`);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
    setLoadingDelete(false);
  };

  return (
    <Flex
      border="1px solid"
      bg="white"
      borderColor="gray.300"
      borderRadius="15px"
      _hover={{ borderColor: 'gray.500' }}
      cursor="pointer"
      onClick={() => onSelectPost && onSelectPost(post)}
    >
      {/* Post Content */}
      <Flex direction="column" width="100%">
        {error && (
          <Alert status="error">
            <AlertIcon />
            <Text mr={2}>{error}</Text>
          </Alert>
        )}
        <Stack spacing={1} p="10px">
          <Stack direction="row" spacing={0.6} align="center" fontSize="9pt">
            {homePage && (
              <>
                {post.communityImageURL ? (
                  <Image
                    borderRadius="full"
                    boxSize="18px"
                    src={post.communityImageURL}
                    alt="Community Avatar"
                    mr={2}
                  />
                ) : (
                  <Icon as={SiInoreader} fontSize={18} mr={1} color="blue.500" /> // Updated fallback icon
                )}
                <Link href={`/r/${post.communityId}`} passHref>
                  <Text fontWeight={700} _hover={{ textDecoration: 'underline' }}>
                    r/{post.communityId}
                  </Text>
                </Link>
                <Icon as={BsDot} color="gray.500" fontSize={8} />
              </>
            )}
            <Text>
              Posted by u/{post.creatorDisplayname} {moment(new Date(post.createdAt?.seconds * 1000)).fromNow()}
            </Text>
          </Stack>
          <Text fontSize="12pt" fontWeight={600}>
            {post.title}
          </Text>
          <Text fontSize="10pt">{post.body}</Text>
          {post.imageURL && (
            <Flex justify="center" align="center" p={2}>
              {loadingImage && <Skeleton height="200px" width="100%" borderRadius={4} />}
              <Image
                src={post.imageURL}
                maxHeight="460px"
                alt="Post Content Image"
                display={loadingImage ? 'none' : 'unset'}
                onLoad={() => setLoadingImage(false)}
              />
            </Flex>
          )}
        </Stack>

        {/* Actions and Vote Section */}
        <Flex ml={1} mb={0.5} color="gray.500" align="center">
          {/* Upvote/Downvote */}
          <Flex align="center" p="8px 10px" borderRadius={4} _hover={{ bg: 'gray.200' }} cursor="pointer">
            <Icon
              as={userVoteValue === 1 ? IoArrowUpCircleSharp : IoArrowUpCircleOutline}
              color={userVoteValue === 1 ? 'orange.400' : 'gray.400'}
              fontSize={22}
              onClick={(event) => onVote(event, post, 1, post.communityId)}
            />
            <Text mx={2} fontSize="9pt" fontWeight={600}>
              {post.voteStatus}
            </Text>
            <Icon
              as={userVoteValue === -1 ? IoArrowDownCircleSharp : IoArrowDownCircleOutline}
              color={userVoteValue === -1 ? 'blue.400' : 'gray.400'}
              fontSize={22}
              onClick={(event) => onVote(event, post, -1, post.communityId)}
            />
          </Flex>

          {/* Comments */}
          <Flex align="center" p="8px 10px" borderRadius={4} _hover={{ bg: 'gray.200' }} cursor="pointer">
            <Icon as={BsChat} mr={2} />
            <Text fontSize="9pt">{post.numberOfComments}</Text>
          </Flex>
          {/* Share */}
          <Flex 
            align="center"
            p="8px 10px"
            borderRadius={4}
            _hover={{ bg: 'gray.200' }}
            cursor="pointer"
            onClick={generateShareableLink}
          >
            <Icon as={IoArrowRedoOutline} mr={2} />
            <Text fontSize="9pt">Share</Text>
          </Flex>
          {shareableLink && (
            <Flex align="center" mt={2}>
              <Text fontSize="9pt" mr={2}>Shareable Link:</Text>
              <a href={shareableLink} target="_blank" rel="noopener noreferrer" className="blue.500">
                {shareableLink}
              </a>
            </Flex>
          )}
  
          {/* Delete (if creator) */}
          {userIsCreator && (
            <Flex
              align="center"
              p="8px 10px"
              borderRadius={4}
              _hover={{ bg: 'gray.200' }}
              cursor="pointer"
              onClick={handleDelete}
            >
              {loadingDelete ? (
                <Spinner size="sm" />
              ) : (
                <>
                  <Icon as={AiOutlineDelete} mr={2} />
                  <Text fontSize="9pt">Delete</Text>
                </>
              )}
            </Flex>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default PostItem;
