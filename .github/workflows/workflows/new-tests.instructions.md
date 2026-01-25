---
applyTo: '**/*.spec.js'
---
Any new tests added or updated should follow these guidelines:
- **DRY Principle**: Avoid code duplication by using shared helper functions or modules for common tasks.
- **Test Design**: Ensure tests are atomic, independent, and clearly named to reflect their purpose.
- **Error Handling**: Implement robust error handling to manage unexpected failures gracefully.
- **Tag Expression**: Use tag expressions (@smoke, @system, and @prod) to categorize tests for easier filtering and execution. The @prod tag should be used for tests that DO NOT modify data, add new data, or delete data. The @smoke tag should be used for tests that are critical to the application's core functionality and need to be run frequently. The @system tag should be used for tests that validate the overall system behavior and integration points. Generally, a test that has @system tag should also have @smoke tag.
- **Independent Tests**: Each test should be able to run independently without relying on the state left by other tests. They need to set up test data and clean up after themselves. If a resource needs to have a specific state, the test should create that resource and set it up accordingly.
- **Page Objects Model**: Use the Page Objects Model to encapsulate page elements and interactions, promoting code reuse and maintainability. The locators of the elements should be defined in the page object files, not in the test files.
- **Playwright Best Practices**: Follow Playwright best practices for writing tests, including using appropriate selectors, waiting for elements to be visible or enabled before interacting with them, and leveraging Playwright's built-in assertions.
- **Consistent Assertions**: Use consistent assertion styles and messages to improve readability and maintainability.
- **Consistent Test Design**: Follow a consistent structure for test cases, including setup, execution, and teardown phases. Consider looking into the existing tests for examples.
- **Specification**: The user must provide the specification of the feature. In case of questions, ask the user.
- **Test by behavior**: One test should validate one behavior. If you need to validate multiple behaviors, create multiple tests. For example, a test should not validate both a 400 and a 401 response for the same endpoint.
- **Failures**: Tests should fail for valid reasons. Avoid false positives or negatives by ensuring tests are reliable and stable. If the test is following the specification and still fails, it is a valid failure.
- **Never**: Never commit unnecessary logs, commented-out code, or debugging statements. As well as never change or remove pre-existing data.
- **Documentation**: Do not add any additional file documentation without user's consent.