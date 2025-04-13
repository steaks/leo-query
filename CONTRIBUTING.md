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
7. Submit a Pull Request with:
   - A clear description of the changes
   - A reference to any related issues

### Contributing Code

1. Fork the repository
2. Clone your fork locally
3. Create a feature branch based on the `main` branch
4. Setup the core library
```bash
npm install
npm run build
```
5. Install [yalc](https://github.com/wclr/yalc)
```
npm install yalc -g
```
6. Publish leo-query locally
```
yalc publish
```
7. Run the test app locally
```bash
cd test-apps/dogs-ts
yalc add leo-query
npm install
npm run dev
```
8. Open your browser to `http://localhost:5173` to preview changes
9. Make your changes in `/src`
    - Run `npm run build && yalc push --scripts --update --replace` to see the changes in the test app
10. Write tests for your changes in `/test`
    - Run `npm run test` to run the tests
11. Submit a Pull Request with:
   - A clear description of the changes
   - A reference to any related issues

### Community & Support

- Join our [discord](https://discord.gg/aucYm6hMsJ)
- Email me at [steven.m.wexler@gmail.com](mailto:steven.m.wexler@gmail.com)