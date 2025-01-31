import React from 'react';
import { Community } from '@/atoms/communitiesAtom';
import { Flex, Button, Box, Icon, Image ,Text } from '@chakra-ui/react';
import { SiInoreader } from "react-icons/si";
import useCommunityData from '@/hooks/useCommunityData';

type HeaderProps = {
    communityData: Community;
    
};

const Header:React.FC<HeaderProps> = ({communityData}) => {

        const{ communityStateValue, onJoinOrLeaveCommunity, loading } = useCommunityData();
        const isJoined = !!communityStateValue.mySnippets.find(
            (item) => item.communityId === communityData.id
        )
    
    return (
        <Flex direction='column' width='100%' height='146px'>
            <Box height='50%' bg='orange.300'/>
            <Flex justify='center' bg="white" flexGrow={1}>
                <Flex width='95%' maxWidth='860px' >
                    {communityStateValue.currentCommunity?.imageURL ? (
                       <Image borderRadius="full"
                       boxSize="66px"
                       src={communityStateValue.currentCommunity.imageURL}
                       alt="Dan Abramov"
                       position="relative"
                       top={-3}
                       color="blue.500"
                       border="4px solid white"
                       
                       />

                    ) : (

                    <Icon as={SiInoreader} 
                    fontSize={65} 
                    position="relative" 
                    top={-3} 
                    color="blue.500"
                    border="4px solid white"
                    borderRadius="50%"
                    />
                    )}
                    <Flex padding="10px 16px">
                        <Flex direction ='column' mr={6}>
                            <Text fontWeight={800} fontSize="16pt">
                                {communityData.id}</Text>
                             <Text fontWeight={600} fontSize="10pt" color="gray.400">
                                c/{communityData.id}</Text>
                        </Flex>
                        <Button 
                        variant= {isJoined ? "outline" : "solid" }
                        height="30px" 
                        pr={6}  
                        pl={6} 
                        isLoading={loading}
                        onClick={() => onJoinOrLeaveCommunity(communityData, isJoined)}>
                            {isJoined ? "Joined": "Join"}
                        </Button>
                    </Flex>
                    
                </Flex>
            </Flex>
        </Flex>
    );
          
};
export default Header;