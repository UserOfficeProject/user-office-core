export const typeDefs = `
    extend type Mutation {
        setPageContent(id: PageName!, text: String): PageMutationsResult
    }


    type PageMutationsResult {
        page: Page
        error: String
    }

    type Page {
        id:Int,
        content: String
    }
`;
