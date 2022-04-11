import { FileInfo } from '@cognite/sdk';
import Loading from 'components/utils/Loading';
import useFilesListQuery from 'hooks/useQuery/useFilesListQuery';
import StatusMessage from 'components/utils/StatusMessage';
import { Button } from '@cognite/cogs.js';

import Card from '../Card';

import { FileLink } from './elements';

export type DocumentsCardProps = {
  assetId: number;
  onHeaderClick?: () => void;
  descriptionField?: string;
  onFileClick?: (file: FileInfo) => void;
};

const DocumentsCard = ({
  assetId,
  onHeaderClick,
  onFileClick,
  descriptionField,
}: DocumentsCardProps) => {
  const {
    data: fileList,
    isLoading,
    error,
  } = useFilesListQuery({
    filter: { assetIds: [assetId] },
    limit: 5,
  });

  const renderLinks = (files: FileInfo[] | undefined) =>
    files?.map((file) => (
      <FileLink key={`filelink-${file.id}`}>
        <Button type="link" onClick={() => onFileClick && onFileClick(file)}>
          {file.name}
        </Button>
        {descriptionField && <span>{file.metadata?.[descriptionField]}</span>}
      </FileLink>
    ));

  const renderContent = () => {
    if (isLoading) {
      return <Loading />;
    }
    if (error) {
      return (
        <StatusMessage
          type="Error"
          message="We could not load your documents."
        />
      );
    }

    if ((fileList || []).length === 0) {
      return <StatusMessage type="Missing.Documents" />;
    }

    return renderLinks(fileList);
  };

  return (
    <Card
      header={{ title: 'Documents', icon: 'Document' }}
      onClick={onHeaderClick}
    >
      {renderContent()}
    </Card>
  );
};

export default DocumentsCard;
