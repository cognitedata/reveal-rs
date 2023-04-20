import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';

export interface VersionSelectorToolbarProps {
  title: string;
  children?: React.ReactNode;
}

export const VersionSelectorToolbar = (props: VersionSelectorToolbarProps) => {
  return (
    <div>
      <PageToolbar title={props.title || ''}>{props.children}</PageToolbar>
    </div>
  );
};
