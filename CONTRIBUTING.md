# Contributing to Enhanced Stopwatch & Timer Suite

Thank you for your interest in contributing! This document provides guidelines and information for contributors.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm 8+
- Git
- Modern web browser for testing

### Setup Development Environment

1. **Fork the Repository**
   - Click the "Fork" button on GitHub
   - Clone your fork locally

2. **Install Dependencies**
   ```bash
   git clone https://github.com/YOUR_USERNAME/stopwatch.git
   cd stopwatch
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm start
   # Opens http://localhost:3000
   ```

## 🛠️ Development Workflow

### Branch Strategy
- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/feature-name` - Individual features
- `bugfix/issue-description` - Bug fixes
- `hotfix/critical-fix` - Critical production fixes

### Making Changes

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Follow the coding standards below
   - Add tests for new functionality
   - Update documentation as needed

3. **Test Your Changes**
   ```bash
   # Run linting
   npm run lint
   
   # Run tests
   npm test
   
   # Check accessibility
   npm run audit
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📝 Coding Standards

### JavaScript
- Use ES6+ features and modules
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Prefer `const` over `let`, avoid `var`

### HTML
- Use semantic HTML5 elements
- Include proper ARIA attributes
- Ensure keyboard navigation support
- Add `alt` text for images

### CSS
- Use CSS custom properties for theming
- Follow BEM methodology for class names
- Ensure responsive design (mobile-first)
- Use `rem` and `em` for scalable units

### Accessibility
- Maintain WCAG 2.1 AA compliance
- Test with screen readers
- Ensure keyboard navigation
- Provide sufficient color contrast

## 🧪 Testing

### Running Tests
```bash
# All tests
npm test

# Specific browser
npm run test -- --project=chromium

# Headed mode (see browser)
npm run test:headed

# Debug mode
npm run test:debug
```

### Writing Tests
- Add tests for new features in `tests/` directory
- Use descriptive test names
- Test both happy path and edge cases
- Include accessibility testing

### Test Structure
```javascript
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should do something specific', async ({ page }) => {
    // Test implementation
  });
});
```

## 📋 Pull Request Guidelines

### Before Submitting
- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] Accessibility tested
- [ ] Performance impact considered

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Screenshots
(If applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests pass
- [ ] Documentation updated
```

## 🐛 Bug Reports

### Before Reporting
1. Check existing issues
2. Test in multiple browsers
3. Clear cache and cookies
4. Test in incognito/private mode

### Bug Report Template
```markdown
**Describe the bug**
Clear description of the issue

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment:**
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 91]
- Version: [e.g. 2.0.0]

**Additional context**
Any other relevant information
```

## ✨ Feature Requests

### Feature Request Template
```markdown
**Is your feature request related to a problem?**
Description of the problem

**Describe the solution you'd like**
Clear description of desired feature

**Describe alternatives you've considered**
Alternative solutions considered

**Additional context**
Mockups, examples, or additional context
```

## 🎯 Areas for Contribution

### High Priority
- 🐛 Bug fixes and stability improvements
- ♿ Accessibility enhancements
- 📱 Mobile experience improvements
- ⚡ Performance optimizations

### Medium Priority
- ✨ New timer features
- 🎨 UI/UX improvements
- 🧪 Test coverage expansion
- 📚 Documentation improvements

### Low Priority
- 🌐 Internationalization
- 🔌 Third-party integrations
- 📊 Analytics and insights
- 🎵 Sound and animation effects

## 🏗️ Architecture Overview

### Module Structure
```
js/
├── ui.js              # UI utilities and DOM helpers
├── theme.js           # Theme management and switching
├── soundController.js # Audio management and controls
├── settings.js        # Configuration and persistence
├── stopwatch.js       # Stopwatch functionality
├── pomodoro.js        # Pomodoro timer logic
└── customTimer.js     # Custom countdown timer
```

### Key Principles
- **Modular Design**: Each module has a single responsibility
- **Event-Driven**: Use events for component communication
- **Progressive Enhancement**: Works without JavaScript
- **Accessibility First**: WCAG 2.1 AA compliance
- **Performance Focused**: Optimize for Core Web Vitals

## 🔧 Development Tools

### Available Scripts
```bash
npm start          # Start development server
npm run lint       # Run ESLint with auto-fix
npm run format     # Format code with Prettier
npm test           # Run all tests
npm run audit      # Performance and accessibility audit
npm run build      # Build for production
npm run deploy     # Deploy to GitHub Pages
```

### Recommended Extensions (VS Code)
- ESLint
- Prettier
- Live Server
- axe DevTools
- Lighthouse

## 📊 Performance Guidelines

### Core Web Vitals Targets
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Best Practices
- Optimize images and assets
- Use lazy loading where appropriate
- Minimize JavaScript bundle size
- Implement proper caching strategies
- Use CSS containment for animations

## 🔒 Security Guidelines

### Client-Side Security
- Validate all user inputs
- Use Content Security Policy (CSP)
- Avoid `eval()` and similar functions
- Sanitize data before storage
- Use HTTPS in production

### Dependencies
- Keep dependencies updated
- Run security audits regularly
- Review dependency licenses
- Avoid unnecessary dependencies

## 📚 Resources

### Documentation
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Progressive Web Apps](https://web.dev/progressive-web-apps/)
- [Core Web Vitals](https://web.dev/vitals/)
- [ES6 Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WebPageTest](https://www.webpagetest.org/)
- [Can I Use](https://caniuse.com/)

## 🤝 Community

### Communication
- 💬 [GitHub Discussions](https://github.com/avinash201199/stopwatch/discussions)
- 🐛 [Issues](https://github.com/avinash201199/stopwatch/issues)
- 📧 [Email](mailto:contact@example.com)

### Code of Conduct
We follow the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). Please read and follow these guidelines to ensure a welcoming environment for all contributors.

## 🎉 Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes for significant contributions
- GitHub contributors graph
- Special mentions for outstanding contributions

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to make this project better! 🙏**
