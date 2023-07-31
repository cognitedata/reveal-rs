import { Switch, Redirect, Route } from 'react-router-dom-v5';
import GlobalStyles from 'global-styles';
import sidecar from 'utils/sidecar';
import { Container } from '@cognite/react-container';
import NotFoundPage from 'pages/Error404';
import { Home } from 'pages/Home';
import { Equipment } from 'pages/Equipment';
import { MenuBar, PAGES } from 'pages/Menubar';
import { AppProvider } from 'contexts';

const App = () => (
  <Container sidecar={sidecar}>
    <GlobalStyles />
    <MenuBar />
    <div style={{ height: 'calc(100vh - 56px)' }}>
      <AppProvider>
        <Switch>
          <Route path={PAGES.EQUIPMENT} render={() => <Equipment />} />
          <Route path={PAGES.UNIT} render={() => <Home />} />
          <Route path={PAGES.FACILITY} render={() => <Home />} />
          <Route path={PAGES.HOME} render={() => <Home />} />
          <Redirect from="" to={PAGES.HOME} />
          <Redirect from="/" to={PAGES.HOME} />
          <Route render={() => <NotFoundPage />} />
        </Switch>
      </AppProvider>
    </div>
  </Container>
);

export default App;
