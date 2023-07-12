import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { formatDistance, format } from 'date-fns';
import { useDebounce } from 'use-debounce';

import {
  Button,
  Table,
  InputExp,
  toast,
  Tooltip,
  Body,
  Loader,
} from '@cognite/cogs.js';

import { translationKeys } from './common';
import CanvasDeletionModal from './components/CanvasDeletionModal';
import { SEARCH_QUERY_PARAM_KEY, TOAST_POSITION } from './constants';
import { EMPTY_FLEXIBLE_LAYOUT } from './hooks/constants';
import useCanvasDeletion from './hooks/useCanvasDeletion';
import useCanvasesWithUserProfiles, {
  CanvasDocumentWithUserProfile,
} from './hooks/useCanvasesWithUserProfiles';
import useCanvasSearch from './hooks/useCanvasSearch';
import { useQueryParameter } from './hooks/useQueryParameter';
import useTableState from './hooks/useTableState';
import { useTranslation } from './hooks/useTranslation';
import { useIndustryCanvasContext } from './IndustryCanvasContext';
import { UserProfile, useUserProfile } from './UserProfileProvider';
import { getCanvasLink } from './utils/getCanvasLink';

const SEARCH_DEBOUNCE_MS = 500;

export const IndustryCanvasHomePage = () => {
  const { canvases, isCreatingCanvas, isListingCanvases, createCanvas } =
    useIndustryCanvasContext();
  const { userProfile } = useUserProfile();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { canvasesWithUserProfiles } = useCanvasesWithUserProfiles({
    canvases,
  });
  const { setQueryString } = useQueryParameter({ key: SEARCH_QUERY_PARAM_KEY });
  const [searchString, setSearchString] = useState<string>('');
  const [debouncedSearchString] = useDebounce(searchString, SEARCH_DEBOUNCE_MS);
  const { filteredCanvases } = useCanvasSearch({
    canvases: canvasesWithUserProfiles,
    searchString: debouncedSearchString,
  });
  useEffect(() => {
    setQueryString(debouncedSearchString);
  }, [debouncedSearchString, setQueryString]);
  const {
    canvasToDelete,
    setCanvasToDelete,
    onDeleteCanvasConfirmed,
    isDeletingCanvas,
  } = useCanvasDeletion();
  const { initialTableState, onTableStateChange } = useTableState();

  const getUpdatedByUserString = (
    currentUserProfile: UserProfile | undefined
  ) => {
    if (
      currentUserProfile === undefined ||
      currentUserProfile.displayName === undefined
    ) {
      return t(translationKeys.BY_UNKNOWN_USER, 'by unknown user');
    }

    if (userProfile.userIdentifier === currentUserProfile.userIdentifier) {
      return t(translationKeys.BY_ME, 'by me');
    }

    return t(translationKeys.BY_USER, {
      user: currentUserProfile.displayName,
      defaultValue: 'by {{user}}',
    });
  };

  const getCreatedByName = (createdByUserProfile: UserProfile | undefined) => {
    if (
      createdByUserProfile === undefined ||
      createdByUserProfile.displayName === undefined
    ) {
      return t(translationKeys.UNKNOWN_USER, 'Unknown user');
    }

    if (userProfile.userIdentifier === createdByUserProfile.userIdentifier) {
      return t(translationKeys.ME, 'Me');
    }

    return createdByUserProfile.displayName;
  };

  const renderNewCanvasButton = () => (
    <div>
      <Button
        icon="Plus"
        iconPlacement="left"
        type="primary"
        disabled={isListingCanvases}
        loading={isCreatingCanvas}
        aria-label={t(
          translationKeys.COMMON_CREATE_CANVAS,
          'Create new canvas'
        )}
        onClick={() => {
          createCanvas({
            canvasAnnotations: [],
            container: EMPTY_FLEXIBLE_LAYOUT,
          }).then(({ externalId }) => navigate(getCanvasLink(externalId)));
        }}
      >
        {t(translationKeys.COMMON_CREATE_CANVAS, 'Create new canvas')}
      </Button>
    </div>
  );

  const renderCopyCanvasLinkButton = (row: CanvasDocumentWithUserProfile) => (
    <Tooltip
      content={t(translationKeys.COMMON_CANVAS_LINK_COPY, 'Copy canvas link')}
    >
      <Button
        type="ghost"
        icon="Link"
        aria-label={t(
          translationKeys.COMMON_CANVAS_LINK_COPY,
          'Copy canvas link'
        )}
        onClick={(ev) => {
          ev.stopPropagation();
          navigator.clipboard.writeText(
            `${window.location.origin}${getCanvasLink(row.externalId)}`
          );
          toast.success(
            <div>
              <b>
                {t(
                  translationKeys.CANVAS_LINK_COPIED_TITLE,
                  'Canvas link copied'
                )}
              </b>
              <p>
                {t(
                  translationKeys.CANVAS_LINK_COPIED_SUB_TITLE,
                  'Canvas link successfully copied to your clipboard'
                )}
              </p>
            </div>,
            {
              toastId: `copy-canvas-${row.externalId}`,
              position: TOAST_POSITION,
            }
          );
        }}
      />
    </Tooltip>
  );

  const renderDeleteCanvasButton = (row: CanvasDocumentWithUserProfile) => (
    <Tooltip content={t(translationKeys.COMMON_CANVAS_DELETE, 'Delete canvas')}>
      <Button
        type="ghost-destructive"
        icon="Delete"
        aria-label={t(translationKeys.COMMON_CANVAS_DELETE, 'Delete canvas')}
        onClick={(ev) => {
          ev.stopPropagation();
          setCanvasToDelete(row);
        }}
      />
    </Tooltip>
  );

  return (
    <>
      <CanvasDeletionModal
        canvas={canvasToDelete}
        onCancel={() => setCanvasToDelete(undefined)}
        onDeleteCanvas={onDeleteCanvasConfirmed}
        isDeleting={isDeletingCanvas}
      />
      <div>
        <HomeHeader>
          <div>
            <h1>Industrial Canvas</h1>
            <span>
              {t(
                translationKeys.HOMEPAGE_IC_DESCRIPTION,
                'Search, explore and manage canvases.'
              )}
            </span>
          </div>
          {renderNewCanvasButton()}
        </HomeHeader>
        {isListingCanvases ? (
          <LoaderWrapper>
            <Loader
              darkMode={false}
              infoTitle={t(
                translationKeys.LOADING_CANVASES,
                'Loading canvases...'
              )}
            />
          </LoaderWrapper>
        ) : (
          <CanvasListContainer>
            <SearchCanvasInput
              placeholder={t(
                translationKeys.HOMEPAGE_TABLE_SEARCH_PLACEHOLDER,
                'Browse canvases'
              )}
              fullWidth
              value={searchString}
              icon="Search"
              onChange={(e) => setSearchString(e.target.value)}
            />
            <Table<CanvasDocumentWithUserProfile>
              initialState={initialTableState}
              onStateChange={onTableStateChange}
              onRowClick={(row) =>
                navigate(
                  getCanvasLink(row.original.externalId, {
                    [SEARCH_QUERY_PARAM_KEY]: debouncedSearchString,
                  })
                )
              }
              columns={[
                {
                  Header: t(translationKeys.HOMEPAGE_TABLE_NAME_COLUMN, 'Name'),
                  accessor: 'name',
                },
                {
                  Header: t(
                    translationKeys.HOMEPAGE_TABLE_UPDATED_AT_COLUMN,
                    'Updated at'
                  ),
                  accessor: 'updatedAtDate',
                  Cell: ({ row }): JSX.Element => {
                    const rowData = row.original;

                    const lastUpdatedString = formatDistance(
                      rowData.updatedAtDate,
                      new Date(),
                      {
                        addSuffix: true,
                      }
                    );

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{lastUpdatedString}</span>
                        <Body level={3} muted>
                          {getUpdatedByUserString(rowData.updatedByUserProfile)}
                        </Body>
                      </div>
                    );
                  },
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore - sortType is not defined in the Cogs table types, but works just fine. Tracked by: https://cognitedata.atlassian.net/browse/CDS-1530
                  sortType: 'datetime',
                },
                {
                  Header: t(
                    translationKeys.HOMEPAGE_TABLE_CREATED_AT_COLUMN,
                    'Created at'
                  ),
                  accessor: 'createdAtDate',
                  Cell: ({ value }: { value: Date }): JSX.Element => (
                    <span>{format(value, 'yyyy-MM-dd')}</span>
                  ),
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore - sortType is not defined in the Cogs table types, but works just fine. Tracked by: https://cognitedata.atlassian.net/browse/CDS-1530
                  sortType: 'datetime',
                },
                {
                  Header: t(
                    translationKeys.HOMEPAGE_TABLE_CREATED_BY_COLUMN,
                    'Created by'
                  ),
                  accessor: (row) => getCreatedByName(row.createdByUserProfile),
                },
                {
                  id: 'row-options',
                  accessor: (row) => (
                    <>
                      {renderCopyCanvasLinkButton(row)}
                      {renderDeleteCanvasButton(row)}
                    </>
                  ),
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore - disableSortBy works just fine, but the type definition is wrong. Tracked by: https://cognitedata.atlassian.net/browse/CDS-1530
                  disableSortBy: true,
                },
              ]}
              rowKey={(canvas) => canvas.externalId}
              dataSource={filteredCanvases}
            />
          </CanvasListContainer>
        )}
      </div>
    </>
  );
};

const LoaderWrapper = styled.div`
  background: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
`;

const HomeHeader = styled.div`
  align-items: center;
  background: rgba(64, 120, 240, 0.06);
  justify-content: space-between;
  height: 120px;
  width: 100%;
  display: flex;
  padding-left: 156px;
  padding-right: 156px;

  h1 {
    font-size: 24px;
    font-weight: 600;
    margin: 0;
  }
`;

const CanvasListContainer = styled.div`
  padding: 16px 156px;
  tbody {
    cursor: pointer;
  }
`;

const SearchCanvasInput = styled(InputExp)`
  background-color: rgba(83, 88, 127, 0.08);
  margin-bottom: 16px;
`;
