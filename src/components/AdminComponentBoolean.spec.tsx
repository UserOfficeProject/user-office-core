import { AdminComponentDate } from "./AdminComponentDate";
import React from "react";
import { createTemplate } from "../test/ProposalTestBed";

var dummyTemplate;
beforeEach(() => {
  dummyTemplate = createTemplate();
});

test("Renders without crashing", () => {
  React.createElement(<AdminComponentDate field={new Pr()} />);
});
