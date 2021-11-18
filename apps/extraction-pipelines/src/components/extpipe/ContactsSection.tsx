import React, { FunctionComponent, useState } from 'react';
import { TableHeadings } from 'components/table/ExtpipeTableCol';
import { useAppEnv } from 'hooks/useAppEnv';
import { useSelectedExtpipe } from 'hooks/useSelectedExtpipe';
import { useExtpipeById } from 'hooks/useExtpipe';
import { User } from 'model/User';
import { AddFieldValueBtn } from 'components/buttons/AddFieldValueBtn';
import { EditModal } from 'components/modals/EditModal';
import { ContactsDialog, isOwnerRole } from 'components/extpipe/ContactsDialog';
import styled from 'styled-components';
import { Section } from 'components/extpipe/Section';
import { Icon } from '@cognite/cogs.js';

const Wrapper = styled.div``;

export const MarginedChildren = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

interface ContactsViewProps {
  canEdit: boolean;
}

export const ContactsSection: FunctionComponent<ContactsViewProps> = ({
  canEdit,
}) => {
  const { project } = useAppEnv();
  const { extpipe: selected } = useSelectedExtpipe();
  const { data: extpipe } = useExtpipeById(selected?.id);
  const [showModal, setShowModal] = useState(false);
  if (!extpipe || !project) {
    return <></>;
  }
  const { contacts } = extpipe;
  const contactsSorted = [...(contacts ?? [])].sort(
    (a, b) =>
      (isOwnerRole(a.role ?? '') ? -1000 : 0) -
      (isOwnerRole(b.role ?? '') ? -1000 : 0)
  );

  const openEdit = () => {
    setShowModal(canEdit);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <Section
      title="Contacts"
      icon="Public"
      editButton={{ onClick: openEdit, canEdit }}
    >
      <Wrapper>
        {contacts && contacts.length > 0 ? (
          <div css="padding: 0 1rem;">
            <MarginedChildren>
              {contactsSorted.map((contact: User) => {
                return (
                  <div
                    css="display: flex; align-items: center; justify-content: space-between; gap: 1rem"
                    key={contact.email}
                  >
                    <div>
                      <div>
                        <span>{contact.name}</span>
                      </div>
                      <div>
                        <a href={`mailto:${contact.email}`}>{contact.email}</a>
                        {contact.sendNotification && (
                          <Icon
                            type="BellNotification"
                            size={12}
                            css="margin-top:2px;margin-left:4px"
                          />
                        )}
                      </div>
                    </div>
                    <div
                      css={`
                        color: #777;
                        text-align: right;
                        font-weight: ${contact.role === 'Owner'
                          ? 'bold'
                          : 'normal'};
                      `}
                    >
                      {contact.role}
                    </div>
                  </div>
                );
              })}
            </MarginedChildren>
          </div>
        ) : (
          <AddFieldValueBtn canEdit={canEdit} onClick={openEdit}>
            {TableHeadings.CONTACTS.toLowerCase()}
          </AddFieldValueBtn>
        )}
      </Wrapper>
      <EditModal
        title={TableHeadings.CONTACTS}
        visible={showModal}
        close={closeModal}
        width={1024}
      >
        <ContactsDialog close={closeModal} />
      </EditModal>
    </Section>
  );
};
