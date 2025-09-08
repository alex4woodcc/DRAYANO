/**
 * Styleguide page showcasing Bootstrap component examples using
 * the application's custom color tokens and theme toggle.
 */
import '@/index.css';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Card } from '@/components/ui/card';

/**
 * Renders the style guide with Bootstrap samples for typography,
 * buttons, forms, alerts, cards, tables and placeholders.
 */
export default function Styleguide() {
    return (
      <Card className="p-4 mb-3">
        <div className="container py-5">
      {/* Header block with theme toggle */}
      <header className="text-center mb-5">
        <h1 className="display-4 fw-bold">Bootstrap Style Guide</h1>
        <p className="lead mb-3">Core components in light and dark modes</p>
        <ThemeToggle />
      </header>

        {/* Typography scale demonstrating headings and text utilities */}
        <section className="mb-5">
        <h2 className="h3">Typography</h2>
        <div className="mt-3">
          <h1>Heading 1</h1>
          <h2>Heading 2</h2>
          <h3>Heading 3</h3>
          <h4>Heading 4</h4>
          <h5>Heading 5</h5>
          <h6>Heading 6</h6>
          <p className="lead">Lead paragraph for emphasis</p>
          <p>Regular body text for longer form content.</p>
          <p className="small text-muted">Small muted caption text</p>
        </div>
      </section>

        {/* Buttons showcasing variants and sizes */}
        <section className="mb-5">
        <h2 className="h3">Buttons</h2>
        <div className="d-flex flex-wrap gap-2 mt-3">
          <button className="btn btn-primary">Primary</button>
          <button className="btn btn-secondary">Secondary</button>
          <button className="btn btn-outline-primary">Outline</button>
          <button className="btn btn-danger">Danger</button>
          <button className="btn btn-link">Link</button>
        </div>
        <div className="d-flex flex-wrap gap-2 mt-3 align-items-center">
          <button className="btn btn-sm btn-primary">Small</button>
          <button className="btn btn-primary">Default</button>
          <button className="btn btn-lg btn-primary">Large</button>
        </div>
      </section>

        {/* Form controls with Bootstrap utilities */}
        <section className="mb-5">
        <h2 className="h3">Forms</h2>
        <form className="row g-3 mt-3">
          <div className="col-md-6">
            <label htmlFor="inputEmail" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="inputEmail"
              placeholder="name@example.com"
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="inputSelect" className="form-label">
              Example select
            </label>
            <select id="inputSelect" className="form-select">
              <option>Choose...</option>
              <option>Option 1</option>
              <option>Option 2</option>
            </select>
          </div>
          <div className="col-12">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="gridCheck"
              />
              <label className="form-check-label" htmlFor="gridCheck">
                Check me out
              </label>
            </div>
          </div>
        </form>
      </section>

        {/* Alerts showcasing contextual feedback messages */}
        <section className="mb-5">
        <h2 className="h3">Alerts</h2>
        <div className="mt-3">
          <div className="alert alert-primary" role="alert">
            A simple primary alert
          </div>
          <div className="alert alert-success" role="alert">
            A success alert
          </div>
          <div className="alert alert-warning" role="alert">
            A warning alert
          </div>
          <div className="alert alert-danger" role="alert">
            A danger alert
          </div>
        </div>
      </section>

      {/* Card component example */}
      <section className="mb-5">
        <h2 className="h3">Cards</h2>
        <div className="card mt-3" style={{ maxWidth: '18rem' }}>
          <div className="card-header">Featured</div>
          <div className="card-body">
            <h5 className="card-title">Card title</h5>
            <p className="card-text">
              Some quick example text to build on the card title.
            </p>
            <a href="#" className="btn btn-sm btn-primary">
              Go somewhere
            </a>
          </div>
        </div>
      </section>

      {/* Table with striped rows */}
      <section className="mb-5">
        <h2 className="h3">Tables</h2>
        <div className="table-responsive">
          <table className="table table-striped mt-3">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">First</th>
                <th scope="col">Last</th>
                <th scope="col">Handle</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">1</th>
                <td>Mark</td>
                <td>Otto</td>
                <td>@mdo</td>
              </tr>
              <tr>
                <th scope="row">2</th>
                <td>Jacob</td>
                <td>Thornton</td>
                <td>@fat</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Placeholder skeleton loaders */}
        <section className="mb-5">
        <h2 className="h3">Skeleton Loaders</h2>
        <div className="card mt-3" aria-hidden="true">
          <div className="card-body">
            <h5 className="card-title placeholder-glow">
              <span className="placeholder col-6"></span>
            </h5>
            <p className="card-text placeholder-glow">
              <span className="placeholder col-7"></span>
              <span className="placeholder col-4"></span>
              <span className="placeholder col-4"></span>
              <span className="placeholder col-6"></span>
              <span className="placeholder col-8"></span>
            </p>
          </div>
        </div>
      </section>
        </div>
      </Card>
    );
  }

