import React, { FunctionComponent, useState } from 'react';
import { ContactCard } from 'components/ContactInformation/ContactCard';
import { TableHeadings } from 'components/table/IntegrationTableCol';
import { useAppEnv } from 'hooks/useAppEnv';
import { useSelectedIntegration } from 'hooks/useSelectedIntegration';
import { useIntegrationById } from 'hooks/useIntegration';
import { User } from 'model/User';
import { AddFieldValueBtn } from 'components/buttons/AddFieldValueBtn';
import { EditModal } from 'components/modals/EditModal';
import {
  ContactsSection,
  isOwnerRole,
} from 'components/integration/ContactsSection';
import styled from 'styled-components';
import { EditableAreaButton } from 'components/integration/EditableAreaButton';

const Wrapper = styled.div``;

const MarginedChildren = styled.div`
  > * + * {
    color: red;
    margin-top: 1rem;
  }
`;

interface ContactsViewProps {
  canEdit: boolean;
}

export const ContactsView: FunctionComponent<ContactsViewProps> = ({
  canEdit,
}) => {
  const { project } = useAppEnv();
  const { integration: selected } = useSelectedIntegration();
  const { data: integration } = useIntegrationById(selected?.id);
  const [showModal, setShowModal] = useState(false);
  if (!integration || !project) {
    return <></>;
  }
  const { contacts } = integration;
  const contactsSorted = [...(contacts ?? [])].sort(
    (a, b) =>
      (isOwnerRole(a.role ?? '') ? -1000 : 0) -
      (isOwnerRole(b.role ?? '') ? -1000 : 0)
  );

  const openEdit = () => {
    setShowModal(canEdit);
  };

  const hideModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <Wrapper>
        {contacts && contacts.length > 0 ? (
          <EditableAreaButton disabled={!canEdit} onClick={openEdit} $full>
            <MarginedChildren>
              {contactsSorted.map((contact: User) => {
                return <ContactCard key={contact.email} {...contact} />;
              })}
            </MarginedChildren>
          </EditableAreaButton>
        ) : (
          <AddFieldValueBtn canEdit={canEdit} onClick={openEdit}>
            {TableHeadings.CONTACTS.toLowerCase()}
          </AddFieldValueBtn>
        )}
      </Wrapper>
      <EditModal visible={showModal} onCancel={hideModal} width={1024}>
        <ContactsSection />
      </EditModal>
    </>
  );
};
