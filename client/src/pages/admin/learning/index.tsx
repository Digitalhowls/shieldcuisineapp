import React from "react";
import { Route, Switch, useLocation } from "wouter";
import CoursesPage from "./courses";
import LessonsPage from "./lessons";
import QuizzesPage from "./quizzes";

export default function LearningModule() {
  const [location, setLocation] = useLocation();

  React.useEffect(() => {
    if (location === "/admin/learning") {
      setLocation("/admin/learning/courses");
    }
  }, [location, setLocation]);

  return (
    <Switch>
      <Route path="/admin/learning/courses" component={CoursesPage} />
      <Route path="/admin/learning/lessons" component={LessonsPage} />
      <Route path="/admin/learning/quizzes" component={QuizzesPage} />
    </Switch>
  );
}