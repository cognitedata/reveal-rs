import { Routes, Route } from 'react-router-dom';
import {
  StyledSplitter,
  SearchResultWrapper,
} from '@data-exploration-app/containers/elements';
import {
  DocumentSearchResults,
  FileSearchResults,
} from '@data-exploration-components/containers';
import { FilePreview } from '@data-exploration-app/containers/File/FilePreview';
import { useFileFilters } from '@data-exploration-app/store';
import { useFlagAdvancedFilters } from '@data-exploration-app/hooks';
import { ResourceItem } from '@cognite/data-exploration';
import {
  useCurrentResourceId,
  useQueryString,
  useSelectedResourceId,
} from '@data-exploration-app/hooks/hooks';
import { useDebounce } from 'use-debounce';
import { SEARCH_KEY } from '@data-exploration-app/utils/constants';
import { useDocumentFilters } from '@data-exploration-app/store/filter/selectors/documentSelectors';
import { useResourceEditable } from '@data-exploration-app/context/ResourceSelectionContext';
import { routes } from '@data-exploration-app/containers/App';

export const FileSearchResultView = () => {
  const isAdvancedFiltersEnabled = useFlagAdvancedFilters();
  const [, openPreview] = useCurrentResourceId();
  const [fileFilter, setFileFilter] = useFileFilters();
  const [documentFilter, setDocumentFilter] = useDocumentFilters();
  const [query] = useQueryString(SEARCH_KEY);
  const [debouncedQuery] = useDebounce(query, 100);
  const editable = useResourceEditable();

  // Here we need to parse params to find selected file's id.
  const selectedFileId = useSelectedResourceId();

  const selectedRow = selectedFileId ? { [selectedFileId]: true } : {};

  const handleRowClick = <T extends Omit<ResourceItem, 'type'>>(item: T) => {
    openPreview(item.id !== selectedFileId ? item.id : undefined);
  };

  return (
    <StyledSplitter
      primaryMinSize={420}
      secondaryInitialSize={700}
      primaryIndex={0}
    >
      <SearchResultWrapper>
        {!isAdvancedFiltersEnabled ? (
          <FileSearchResults
            showCount
            selectedRow={selectedRow}
            filter={fileFilter}
            allowEdit={editable} // ??
            onClick={handleRowClick}
            onFilterChange={(newValue: Record<string, unknown>) =>
              setFileFilter(newValue)
            }
            query={debouncedQuery}
          />
        ) : (
          <DocumentSearchResults
            enableAdvancedFilters={isAdvancedFiltersEnabled}
            query={query}
            selectedRow={selectedRow}
            filter={documentFilter}
            onClick={handleRowClick}
            onFilterChange={(newValue: Record<string, unknown>) =>
              setDocumentFilter(newValue)
            }
          />
        )}
      </SearchResultWrapper>

      {Boolean(selectedFileId) && (
        <SearchResultWrapper>
          <Routes>
            <Route
              path={routes.viewDetail.path}
              element={<FilePreview fileId={selectedFileId!} />}
            />
            <Route
              path={routes.viewDetailTab.path}
              element={<FilePreview fileId={selectedFileId!} />}
            />
          </Routes>
        </SearchResultWrapper>
      )}
    </StyledSplitter>
  );
};
