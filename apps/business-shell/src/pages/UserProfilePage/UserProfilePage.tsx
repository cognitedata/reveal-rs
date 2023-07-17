import {
  useTypedTranslation as useTranslation,
  getLanguage,
  selectLanguage,
} from '@cognite/cdf-i18n-utils';
import { trackEvent } from '@cognite/cdf-route-tracker';
import {
  Language,
  UserProfilePage as SharedUserProfilePage,
} from '@cognite/user-profile-components';

import { useUserInfo } from '../../hooks/useUserInfo';

const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', label: 'English | en' },
  { code: 'zh', label: '中文 (Zhōngwén), 汉语, 漢語 | zh' },
  { code: 'nl', label: 'Nederlands, Vlaams | nl' },
  { code: 'fr', label: 'Français, langue française | fr' },
  { code: 'de', label: 'Deutsch | de' },
  { code: 'de-AT', label: 'Deutsch AT | de-AT' },
  { code: 'it', label: 'Italiano | it' },
  { code: 'ja', label: '日本語 (にほんご／にっぽんご) | ja' },
  { code: 'ko', label: '한국어 (韓國語), 조선말 (朝鮮語) | ko' },
  { code: 'pt', label: 'Português | pt' },
  { code: 'ro', label: 'română | ro' },
  { code: 'es', label: 'Español, Castellano | es' },
  { code: 'sv', label: 'svenska | sv' },
];
const selectedLanguage =
  SUPPORTED_LANGUAGES.find((language) => language.code === getLanguage()) ||
  SUPPORTED_LANGUAGES[0];

export const UserProfilePage = (): JSX.Element => {
  const { t } = useTranslation();
  const { data = {}, isLoading } = useUserInfo();
  const { name, email, picture: profilePicture } = data;

  const handleLanguageChange = (language: Language | undefined) => {
    selectLanguage(language?.code || 'en');
  };

  return (
    <SharedUserProfilePage
      userInfo={{ name, email, profilePicture }}
      isUserInfoLoading={isLoading}
      selectedLanguage={selectedLanguage}
      supportedLanguages={SUPPORTED_LANGUAGES}
      onLanguageChange={handleLanguageChange}
      sidebarLocale={{
        personalInfoTabBtnText: t('PERSONAL_INFO_TAB_BTN_TEXT'),
        languageTabBtnText: t('LANGUAGE_TAB_BTN_TEXT'),
      }}
      personalInfoTabLocale={{
        title: t('PERSONAL_INFO_TAB_TITLE'),
        nameFieldLabel: t('NAME_FIELD_LABEL'),
        nameFieldHelpText: t('NAME_FIELD_HELP_TEXT'),
        emailFieldLabel: t('EMAIL_FIELD_LABEL'),
        emailFieldHelpText: t('EMAIL_FIELD_HELP_TEXT'),
      }}
      languageTabLocale={{
        title: t('LANGUAGE_TAB_TITLE'),
        languageFieldLabel: t('LANGUAGE_FIELD_LABEL'),
      }}
      onTrackEvent={(eventName, metaData) => {
        trackEvent(`BusinessShell.UserProfilePage.${eventName}`, metaData);
      }}
    />
  );
};
