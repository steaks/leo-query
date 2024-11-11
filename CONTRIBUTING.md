# Contributing

Thank you for your interest in contributing! This document will guide you through the various ways you can contribute to this project.

## Ways to Contribute

### Reporting Issues

- Use the GitHub issue tracker to report bugs or suggest features
- Please search existing issues before creating a new one
- Provide as much detail as possible including steps to reproduce, expected behavior, and actual behavior

### Asking Questions

- Create a GitHub issue and tag it with `question`
- Search existing issues first to see if your question has already been answered
- Be specific and provide context about what you're trying to accomplish

### Improving Documentation

1. Fork the repository
2. Clone your fork locally
3. Create a feature branch based on the `main` branch
4. Run the documentation site locally:
```bash
cd docs
npm install
npm run docs:dev   
```
5. Open your browser to `http://localhost:5173` to preview changes
6. Update the documentation as needed in `docs/`
7. Submit a Pull Request:
   - Describe what documentation was added/changed
   - Include screenshots of visual changes if applicable 
   - Reference any related issues

### Contributing Code

1. Fork the repository
2. Clone your fork locally
3. Create a feature branch based on the `main` branch
4. Setup the core library
```bash
npm install
npm run build
```
5. Run the test app locally
```
cd test-apps/bears-ts
npm install
npm run dev
```
6. Open your browser to `http://localhost:5173` to preview changes
7. Make your changes in `/src`
    - Run `npm run build` to see the changes in the test app
8. Write tests for your changes in `/test`
    - Run `npm test` to run the tests
7. Submit a Pull Request with:
   - A clear description of the changes
   - Any related issue numbers
   - Screenshots if applicable

### Community & Support

- Join our [Discord](https://discord.gg/aucYm6hMsJ)
- Email me at [steven.m.wexler@gmail.com](mailto:steven.m.wexler@gmail.com)