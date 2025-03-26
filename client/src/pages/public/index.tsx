import React from 'react';
import { Route, Switch, useRoute } from 'wouter';
import PublicLayout from './layout';
import HomePage from './home';
import PageView from './page-view';
import NotFound from '@/pages/not-found';

const PublicPortal: React.FC = () => {
  const [isHome] = useRoute('/public');
  
  return (
    <PublicLayout>
      <Switch>
        <Route path="/public" component={HomePage} />
        <Route path="/public/pagina/:slug" component={PageView} />
        <Route component={NotFound} />
      </Switch>
    </PublicLayout>
  );
};

export default PublicPortal;