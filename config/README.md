## config directory

Contains various files used to tell run-tests or the nightwatch test what is possible or available for switches or a given products.

- browsers.json: What browsers are currently supported? This should not be altered.
- environments.json: What environments can tests be run in? This should not be altered.
- environmentsProductsMap.json: What products can run in what environment? For most testing purposes, this should contain one entry
- logins.json: What logins can be used for what product, what domain in which environments? See the example in the file.
- productURLMap.json: maps product names to the actual URL fragment. For example, "zebrafish": "dbx"
- products.json: What products are supported? It is typically one product.
- shortcuts.json: Aimed reducing the amount of typing needed when running tests. Shortcuts must be at least two letters. For now, products are the only shortcuts supported.
- features.json: contains the available features for application under test. If your tests/app-name contains sub-directories, then adding them as features allows only the tests in the sub-directory run
- testrail.json: contains all the Project Names and IDs needed to process the test results
