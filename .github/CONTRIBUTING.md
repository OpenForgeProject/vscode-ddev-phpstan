# Contributing to DDEV PHPStan Extension

Thank you for your interest in contributing to the DDEV PHPStan extension! We welcome contributions from the community.

## Ways to Contribute

- **Bug Reports**: Help us identify and fix issues
- **Feature Requests**: Suggest new features and improvements
- **Code Contributions**: Submit pull requests with bug fixes or new features
- **Documentation**: Improve documentation and examples
- **Testing**: Help test new releases and report issues

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- VS Code
- DDEV
- Git

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/vscode-ddev-phpstan.git
   cd vscode-ddev-phpstan
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build the Extension**
   ```bash
   npm run compile
   ```

4. **Run Tests**
   ```bash
   npm test
   ```

5. **Open in VS Code**
   ```bash
   code .
   ```

6. **Start Debugging**
   - Press `F5` to launch Extension Development Host
   - Test your changes in the new VS Code window

### Project Structure

```
src/
├── extension.ts              # Main extension entry point
├── models/                   # Data models and interfaces
├── services/                 # Core business logic
├── shared/                   # Shared utilities and services
└── test/                     # Test files
```

## Development Guidelines

### Code Style

- Use TypeScript with strict type checking
- Follow existing code style and patterns
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Test with different DDEV setups if possible

### Commits

We follow conventional commits:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `test:` Test additions/changes
- `refactor:` Code refactoring
- `chore:` Maintenance tasks

Example: `feat: add auto-detection of PHPStan config files`

## Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write code following our guidelines
   - Add/update tests as needed
   - Update documentation if required

3. **Test Thoroughly**
   ```bash
   npm run compile
   npm run lint
   npm test
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: your descriptive commit message"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

   Then create a Pull Request on GitHub.

### PR Requirements

- [ ] All tests pass
- [ ] Code follows project style
- [ ] Documentation updated (if needed)
- [ ] CHANGELOG.md updated (for notable changes)
- [ ] PR description explains the change

## Issue Guidelines

### Bug Reports

Please use the bug report template and include:

- Extension version
- VS Code version
- DDEV version
- PHPStan version
- Operating system
- Clear reproduction steps
- Expected vs actual behavior
- Logs/error messages

### Feature Requests

Please use the feature request template and include:

- Clear description of the problem
- Proposed solution
- Use case and examples
- Priority level

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Maintain professional communication

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or inflammatory comments
- Personal attacks
- Publishing private information

## Getting Help

- **Questions**: Open a discussion on GitHub
- **Issues**: Use the issue templates
- **Chat**: Contact the maintainers

## License

By contributing, you agree that your contributions will be licensed under the GPL-3.0 License.

## Recognition

Contributors will be recognized in:
- CHANGELOG.md for notable contributions
- GitHub contributors page
- Release notes for significant features

Thank you for contributing to make the DDEV PHPStan extension better! 🚀
