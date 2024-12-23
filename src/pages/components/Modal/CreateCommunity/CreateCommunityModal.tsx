import { 
  Spinner,
  Button, 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalCloseButton, 
  ModalBody, 
  ModalFooter, 
  Box, 
  Text, 
  Input, 
  Stack, 
  Checkbox, 
  Flex, 
  Icon 
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { BsFillEyeFill, BsFillPersonFill } from "react-icons/bs";
import { HiLockClosed } from "react-icons/hi";
import { useAuthState } from 'react-firebase-hooks/auth'; // Import useAuthState for user authentication
import { doc, getDoc, setDoc, serverTimestamp, runTransaction } from 'firebase/firestore'; // Firestore methods
import { auth, firestore } from '../../../../firebase/clientApp'; // Import auth and firestore

type CreateCommunityModalProps = {
    open: boolean;
    handleClose: () => void;
};

const CreateCommunityModal:React.FC<CreateCommunityModalProps> = ({
    open,
    handleClose
  })  => {
    const [user] = useAuthState(auth);
    const [communityName, setCommunityName] = useState('');
    const [charsRemaining, setCharsRemaining] = useState(21);
    const [communityType, setCommunityType] = useState("public");
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.value.length > 21) return;
        
        setCommunityName(event.target.value)
        // recalculate how many chars we have left in the name
        setCharsRemaining(21-event.target.value.length)
    }
    
    const onCommunityTypeChange = (event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setCommunityType(event.target.name)
    };

    const handleCreateCommunity = async () => {
      if (error) setError("");
      
      // Validate the community name
      const format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
      if(format.test(communityName) || communityName.length<3){
        setError('Community name should be at least 3-21 characters long and should not contain special characters.')
        return;
      }

      setLoading(true);
      
      try { 
       
        
        const communityDocRef = doc(firestore, 'communities', communityName);
        
        await runTransaction(firestore,async (transaction) => {

        // Check if community already exists in db
                const communityDoc = await transaction.get(communityDocRef);
                
                if (communityDoc.exists()) {
                  throw new Error(`Sorry, c/${communityName} already exists. Please choose a different name.`);
                
                }
        // Create community
                transaction.set(communityDocRef ,{
                  
                  creatorId:user?.uid,
                  createdAt: serverTimestamp(),
                  numberOfMembers: 1,
                  privacyType: communityType,
                });


        // Create community snippets on user

                transaction.set(doc(firestore,`users/${user?.uid}/communitySnippets`, communityName),{
                  communityId: communityName,
                  isModerator: true,
                })

        });
        

        
      
      } catch (error:any) {
        console.log('handleCreateCommunity error', error);
        setError(error.message);
        
      }
     

        setLoading(false);
    };



    return (
        <>
    
          <Modal isOpen={open} onClose={handleClose} size="lg">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader 
              display='flex' 
              flexDirection='column' 
              fontSize={15} 
              padding={3}
              >
                Create a Community
              </ModalHeader>
              
              <Box pl={3} pr={3}>
                <ModalCloseButton />
                <ModalBody 
                display='flex' 
                flexDirection="column" 
                padding="10px 0px" 
              >
                    <Text fontWeight={600} fontSize={15}>
                        Name
                    </Text>
                    <Text fontSize={11} color="gray.500">
                        Community Name including capitalization cannot be changed
                    </Text>
                    <Text 
                        position="relative" 
                        top="28px" 
                        left='10px' 
                        width="20px" 
                        color="gray.400"
                    >
                        c/
                    </Text>

                   <Input 
                        position="relative"
                        value={communityName} 
                        size='small' 
                        pl="22px" 
                        onChange={handleChange} 
                    />
                    <Text 
                    fontSize='9pt' 
                    color={charsRemaining === 0 ? "red" : "gray.500"}
                    >
                        {charsRemaining} Characters remaining
                    </Text>
                    <Text fontSize="9pt" color="red" pt={1}>{error}</Text>
                    <Box mt={4} mb={4}>
                        <Text fontWeight={600} fontSize={15}>
                            Community Type
                        </Text>
                        {/* checkbox */}
                        <Stack spacing={2}>
                            <Checkbox 
                            name="public" 
                            isChecked={communityType === 'public'} 
                            onChange={onCommunityTypeChange}
                            >
                              <Flex align="center">
                                <Icon as={BsFillPersonFill} color="gray.500" mr={2} />
                                <Text fontSize="10pt" mr={1}>
                                    Public
                                </Text>
                                <Text fontSize="8pt" color="gray.500" pt={1}>
                                    Amyone can view, post, and comment to this community 
                                </Text>
                              </Flex>
                            </Checkbox>

                            <Checkbox 
                            name="restrictred" 
                            isChecked={communityType === 'restricted'} 
                            onChange={onCommunityTypeChange} 
                            >
                              <Flex align="center">
                                <Icon as={BsFillEyeFill} color="gray.500" mr={2} />
                                <Text fontSize="10pt" mr={1}>
                                    Restricted
                                </Text>
                                <Text fontSize="8pt" color="gray.500" pt={1}>
                                    Amyone can view this community, but only approved users can post
                                </Text>
                              </Flex>
                            </Checkbox>

                            <Checkbox 
                            name="private"
                            isChecked={communityType === 'private'} 
                            onChange={onCommunityTypeChange}
                            >
                              <Flex align="center">
                                <Icon as={HiLockClosed} color="gray.500" mr={2} />
                                <Text fontSize="10pt" mr={1}>
                                    Private
                                </Text>
                                <Text fontSize="8pt" color="gray.500" pt={1}>
                                    Only approved users can view adn submit to this community 
                                </Text>
                              </Flex>
                            </Checkbox>
                        </Stack>
                    </Box>
                </ModalBody>
              </Box>

              <ModalFooter bg="gray.100" borderRadius="0px 0px 10px 10px" >
                <Button 
                    variant="outline" 
                    height="30px" mr={3} 
                    onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button height="30px" onClick={handleCreateCommunity} isLoading={loading}>
                    Create Community
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
)}
export default CreateCommunityModal;