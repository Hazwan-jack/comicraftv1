
import { auth } from '@/firebase/clientApp';
import useCommunityData from '@/hooks/useCommunityData';
import About from '@/pages/components/Community/About';
import PageContent from '@/pages/components/Layout/PageContent';
import NewPostForm from '@/pages/components/Posts/NewPostForm';
import { Box, Text } from '@chakra-ui/react';
import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';


const SubmitPostPage: React.FC = () => {
  const [user] = useAuthState(auth);
  const { communityStateValue } = useCommunityData();
  console.log("COMMUNITY", communityStateValue);

  return (
    <PageContent>
      <>
        <Box p="14px 0px" borderBottom="1px solid" borderColor="white">
          <Text>Create a Post</Text>
        </Box>
        {user && <NewPostForm user={user} communityImageUrl={communityStateValue.currentCommunity?.imageURL} />}
      </>
      <>
        {communityStateValue.currentCommunity && (
          <About communityData={communityStateValue.currentCommunity} />
        )}
      </>
    </PageContent>
  );
};

export default SubmitPostPage;
